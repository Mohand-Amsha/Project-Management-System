import { Types } from "mongoose";
import { User, IUser } from "../models/User.js";
import { Organization } from "../models/Organization.js";
import { Invite } from "../models/Invite.js";
import { AppError } from "../utils/AppError.js";
import { slugify, uniqueSlug } from "../utils/slug.js";
import {
  signAccessToken,
  signRefreshToken,
  JwtPayload,
} from "../utils/jwt.js";
import { hashInviteToken } from "../utils/inviteToken.js";
import { RegisterInput, LoginInput, AcceptInviteInput } from "../validators/auth.validator.js";

interface AuthResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

const buildTokens = (user: IUser): { accessToken: string; refreshToken: string } => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    organizationId: user.organization.toString(),
    role: user.role,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  organization: user.organization,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError("Email already in use", 409);

  // 1. Create organization (owner will be set after user is created)
  const baseSlug = slugify(input.organizationName) || "org";
  const org = await Organization.create({
    name: input.organizationName,
    slug: uniqueSlug(baseSlug),
    owner: new Types.ObjectId(), // placeholder, replaced with the real user id below
  });

  // 2. Create user as admin of that org
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: "admin",
    organization: org._id,
  });

  // 3. Set the real owner
  org.owner = user._id;
  await org.save();

  const tokens = buildTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);
  if (!user.isActive) throw new AppError("Account is disabled", 403);

  const ok = await user.comparePassword(input.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = buildTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).populate("organization", "name slug plan");
  if (!user) throw new AppError("User not found", 404);
  return sanitizeUser(user);
};
// ---------- Invitations ----------

/** Public: what the accept-invite page shows before the person sets a password. */
export const getInviteInfo = async (token: string) => {
  const invite = await Invite.findOne({
    tokenHash: hashInviteToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).populate("organization", "name");

  if (!invite) throw new AppError("This invitation is invalid or has expired", 404);

  const organization = invite.organization as unknown as { name: string };
  return { email: invite.email, role: invite.role, organizationName: organization.name };
};

export const acceptInvite = async (input: AcceptInviteInput): Promise<AuthResult> => {
  // Claim the invite atomically so one link can never create two accounts
  const invite = await Invite.findOneAndUpdate(
    {
      tokenHash: hashInviteToken(input.token),
      status: "pending",
      expiresAt: { $gt: new Date() },
    },
    { status: "accepted", acceptedAt: new Date() }
  );
  if (!invite) throw new AppError("This invitation is invalid or has expired", 404);

  try {
    const user = await User.create({
      name: input.name,
      email: invite.email,
      password: input.password,
      role: invite.role,
      organization: invite.organization,
      isEmailVerified: true, // they proved ownership by opening the emailed link
    });

    const tokens = buildTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  } catch (err) {
    // Account creation failed (e.g. the email was registered meanwhile): free the invite again
    await Invite.updateOne({ _id: invite._id }, { status: "pending", $unset: { acceptedAt: 1 } });
    throw err;
  }
};
