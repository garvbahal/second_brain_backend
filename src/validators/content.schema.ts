import { z } from "zod";

export const createContentSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    link: z.string().min(1, { message: "Link is requried" }),
    tags: z.array(z.string()).optional(),
});

export const deleteContentSchema = z.object({
    contentId: z
        .string()
        .max(200, { message: "Content id is required" })
        .min(1),
});
