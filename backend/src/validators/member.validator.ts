import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createInviteSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    role: z.enum(["pm", "member"]).optional(),
  }),
});

export const inviteIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const updateMemberSchema = z.object({
  params: z.object({ userId: objectId }),
  body: z
    .object({
      role: z.enum(["admin", "pm", "member"]).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((b) => b.role !== undefined || b.isActive !== undefined, {
      message: "Provide a role or isActive",
    }),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>["body"];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>["body"];
