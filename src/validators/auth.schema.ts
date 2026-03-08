import { z } from "zod";

export const signupSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username is must be atleast 3 characters" }),
    password: z.string().min(3, { message: "Password is required" }),
});

export const signinSchema = z.object({
    username: z.string().min(3, { message: "Username is required" }),
    password: z.string().min(3, { message: "Password is required" }),
});
