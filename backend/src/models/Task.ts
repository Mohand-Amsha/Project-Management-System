import mongoose, { Schema, Document, Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  key: string;              // human-readable ID e.g. "WEB-42"
  project: Types.ObjectId;
  organization: Types.ObjectId;
  reporter: Types.ObjectId; // who created it
  assignee?: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;         // ordering within its status column
  labels: string[];
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    labels: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// A task key is unique per project
taskSchema.index({ project: 1, key: 1 }, { unique: true });

// Fast Kanban queries: get all tasks in a project, grouped by status, ordered
taskSchema.index({ project: 1, status: 1, position: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);