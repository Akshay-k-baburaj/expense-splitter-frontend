import { z } from "zod";

export const groupSchema = z.object({
  groupName: z.string().trim().min(1, "Group name is required").max(100, "Group name must be 100 characters or fewer"),
  description: z.string(),
  currencyCode: z.string().regex(/^[A-Z]{3}$/, "Choose a currency"),
});

export const memberSchema = z.object({
  userId: z.number().int().positive("Enter a positive whole-number user ID").refine(Number.isSafeInteger, "User ID is too large"),
});

export type GroupFormValues = z.infer<typeof groupSchema>;
export type MemberFormValues = z.infer<typeof memberSchema>;
