import crypto from "crypto";

export const hashInviteToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** 64 hex chars of randomness; only the hash is stored in the database. */
export const generateInviteToken = (): { token: string; tokenHash: string } => {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashInviteToken(token) };
};
