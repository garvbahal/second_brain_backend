import { z } from "zod";

export const seeShareLinkSchema = z.object({
    shareLink: z.string().min(1, { message: "Share Link is required" }),
});
