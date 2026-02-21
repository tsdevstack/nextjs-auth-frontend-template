import { z } from "zod";

// Base schemas (reusable pieces)
export const emailSchema = z.string().email("Enter a valid email");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z.string().min(1, "This field is required");

export const botDetectionSchema = z.object({
  score: z.number(),
  reasons: z.array(z.string()),
  isBot: z.boolean(),
  stats: z.object({
    mouseMovements: z.number(),
    typingEvents: z.number(),
    focusEvents: z.number(),
    timeSpent: z.number(),
  }),
  honeypotTriggered: z.boolean(),
});