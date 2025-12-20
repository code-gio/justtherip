import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.email(),
});

export type MagicLinkSchema = typeof magicLinkSchema;
