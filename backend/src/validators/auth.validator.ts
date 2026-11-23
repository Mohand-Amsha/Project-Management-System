import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
    organizationName: z.string().trim().min(2).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1, "Password is required"),
  }),
});

const inviteToken = z.string().regex(/^[0-9a-f]{64}$/, "Invalid invitation link");

export const inviteInfoSchema = z.object({
  params: z.object({ token: inviteToken }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: inviteToken,
    name: z.string().trim().min(2).max(80),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
  }),
});

export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>["body"];
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];