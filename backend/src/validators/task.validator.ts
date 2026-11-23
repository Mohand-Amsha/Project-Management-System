import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(5000).optional(),
    assignee: objectId.optional().nullable(),
    status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    labels: z.array(z.string().trim().max(30)).max(10).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
  params: z.object({ projectId: objectId }),
});

export const updateTaskSchema = z.object({
  body: createTaskSchema.shape.body.partial().extend({
    position: z.number().int().min(0).optional(),
  }),
  params: z.object({ id: objectId }),
});

export const taskIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const listTasksSchema = z.object({
  params: z.object({ projectId: objectId }),
  query: z.object({
    status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignee: objectId.optional(),
    search: z.string().trim().max(100).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type ListTasksQuery = z.infer<typeof listTasksSchema>["query"];