import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(3, {
    message: "Group name must be at least 3 characters",
  }),
  monthlyAmount: z.coerce
    .number()
    .min(1, { message: "Monthly amount must be greater than 0" }),
  description: z.string().optional(),
  rules: z.string().optional(),
  start_month: z.string(),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export const addMemberSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  message: z.string().optional(),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
