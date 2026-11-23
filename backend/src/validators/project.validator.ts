import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional(),
    key: z
      .string()
      .trim()
      .toUpperCase()
      .min(2)
      .max(6)
      .regex(/^[A-Z0-9]+$/, "Key must contain only A-Z and 0-9"),
    status: z
      .enum(["planning", "active", "on_hold", "completed", "archived"])
      .optional(),
    startDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    color: z
      .string()
      .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color")
      .optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
  params: z.object({ id: objectId }),
});

export const projectIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const addMembersSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    userIds: z.array(objectId).min(1, "At least one user ID required"),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];