import mongoose, { Schema, Document, Types } from "mongoose";

export type InviteRole = "pm" | "member";
export type InviteStatus = "pending" | "accepted" | "revoked";

export interface IInvite extends Document {
  _id: Types.ObjectId;
  email: string;
  organization: Types.ObjectId;
  invitedBy: Types.ObjectId;
  role: InviteRole;
  /** SHA-256 of the secret token. The raw token only exists in the invite link. */
  tokenHash: string;
  status: InviteStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["pm", "member"],
      default: "member",
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false, // never returned by queries unless asked for
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Find an organization's live invites for an email quickly
inviteSchema.index({ organization: 1, email: 1, status: 1 });

export const Invite = mongoose.model<IInvite>("Invite", inviteSchema);
