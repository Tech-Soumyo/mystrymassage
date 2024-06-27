import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "content must be at least 10 charecters")
    .max(300, "content must be within 300 charecters"),
});
