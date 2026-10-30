import { z } from "zod";

export const userSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50, "Username must be 50 characters or fewer"),
});

export type UserFormValues = z.infer<typeof userSchema>;
