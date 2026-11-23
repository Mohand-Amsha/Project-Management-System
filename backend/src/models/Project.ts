import mongoose, { Schema, Document, Types } from "mongoose";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  key: string; // short prefix, e.g. "ACME" for task IDs like ACME-123
  organization: Types.ObjectId;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  status: ProjectStatus;
  startDate?: Date;
  dueDate?: Date;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 6,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "archived"],
      default: "planning",
      index: true,
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    color: {
      type: String,
      default: "#3b82f6",
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color"],
    },
  },
  { timestamps: true }
);

// A project key must be unique *within an organization*
projectSchema.index({ organization: 1, key: 1 }, { unique: true });

// Fast lookup for "my projects"
projectSchema.index({ organization: 1, members: 1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);