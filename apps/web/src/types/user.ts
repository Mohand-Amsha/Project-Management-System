export type UserRole = "admin" | "pm" | "member";
export type InviteRole = "pm" | "member";

/** A person in the organization, as returned by GET /api/members. */
export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Invite {
  _id: string;
  email: string;
  role: InviteRole;
  status: "pending" | "accepted" | "revoked";
  expiresAt: string;
  createdAt: string;
  invitedBy?: { _id: string; name: string };
}

/** Returned once, when an invite is created. The link is not retrievable later. */
export interface CreatedInvite {
  invite: Invite;
  inviteUrl: string;
}

/** Public info shown on the accept-invite page. */
export interface InviteInfo {
  email: string;
  role: InviteRole;
  organizationName: string;
}
