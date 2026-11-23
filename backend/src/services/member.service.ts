import { Invite, IInvite, Organization, User } from "../models/index.js";
import { AppError } from "../utils/AppError.js";
import { generateInviteToken } from "../utils/inviteToken.js";
import { JwtPayload } from "../utils/jwt.js";
import { sendInviteEmail } from "./email.service.js";
import type { CreateInviteInput, UpdateMemberInput } from "../validators/member.validator.js";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MEMBER_FIELDS = "name email avatar role isActive lastLoginAt createdAt";

const toPublicInvite = (invite: IInvite) => ({
  _id: invite._id,
  email: invite.email,
  role: invite.role,
  status: invite.status,
  expiresAt: invite.expiresAt,
  createdAt: invite.createdAt,
});

/** Everyone in the caller's organization (any signed-in member can see the team). */
export const listMembers = async (auth: JwtPayload) =>
  User.find({ organization: auth.organizationId }).select(MEMBER_FIELDS).sort({ name: 1 });

export const createInvite = async (input: CreateInviteInput, auth: JwtPayload) => {
  const email = input.email.trim().toLowerCase();
  const role = input.role ?? "member";

  if (auth.role === "pm" && role !== "member") {
    throw new AppError("Project managers can only invite members", 403);
  }

  // Emails are unique across the whole app, so any existing account blocks the invite
  const existing = await User.findOne({ email }).select("_id");
  if (existing) throw new AppError("A user with this email already exists", 409);

  const [organization, inviter] = await Promise.all([
    Organization.findById(auth.organizationId).select("name"),
    User.findById(auth.userId).select("name"),
  ]);
  if (!organization || !inviter) throw new AppError("Organization not found", 404);

  // One live invite per email: a new one replaces any earlier pending invite
  await Invite.updateMany(
    { organization: auth.organizationId, email, status: "pending" },
    { status: "revoked" }
  );

  const { token, tokenHash } = generateInviteToken();
  const invite = await Invite.create({
    email,
    role,
    organization: auth.organizationId,
    invitedBy: auth.userId,
    tokenHash,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  const inviteUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/accept-invite?token=${token}`;
  await sendInviteEmail({
    to: email,
    inviteUrl,
    organizationName: organization.name,
    invitedByName: inviter.name,
  });

  // The raw token is only ever returned here, once
  return { invite: toPublicInvite(invite), inviteUrl };
};

export const listInvites = async (auth: JwtPayload) => {
  const invites = await Invite.find({
    organization: auth.organizationId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .populate("invitedBy", "name")
    .sort({ createdAt: -1 });

  return invites;
};

export const revokeInvite = async (inviteId: string, auth: JwtPayload): Promise<void> => {
  const invite = await Invite.findOneAndUpdate(
    { _id: inviteId, organization: auth.organizationId, status: "pending" },
    { status: "revoked" }
  );
  if (!invite) throw new AppError("Invitation not found", 404);
};

/** Change a member's role and/or deactivate or reactivate them. Admin only (enforced in the routes). */
export const updateMember = async (
  userId: string,
  input: UpdateMemberInput,
  auth: JwtPayload
) => {
  if (userId === auth.userId) {
    throw new AppError("You cannot change your own role or status", 400);
  }

  const [target, organization] = await Promise.all([
    User.findOne({ _id: userId, organization: auth.organizationId }).select("_id"),
    Organization.findById(auth.organizationId).select("owner"),
  ]);
  if (!target) throw new AppError("Member not found", 404);
  if (organization?.owner.toString() === userId) {
    throw new AppError("The organization owner cannot be modified", 400);
  }

  const update: Record<string, unknown> = {};
  if (input.role !== undefined) update.role = input.role;
  if (input.isActive !== undefined) update.isActive = input.isActive;

  const user = await User.findOneAndUpdate(
    { _id: userId, organization: auth.organizationId },
    { $set: update },
    { new: true, runValidators: true }
  ).select(MEMBER_FIELDS);
  if (!user) throw new AppError("Member not found", 404);

  return user;
};
