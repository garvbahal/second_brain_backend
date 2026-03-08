import express, { type Request, type Response } from "express";
const app = express();
import jwt from "jsonwebtoken";
import { ContentModel, UserModel } from "./db.js";
import bcrypt from "bcrypt";
app.use(express.json());

import { jwtPassword } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { signupSchema, signinSchema } from "./validators/auth.schema.js";
import {
    createContentSchema,
    deleteContentSchema,
} from "./validators/content.schema.js";

app.post("/api/v1/signup", async (req, res) => {
    try {
        const result = signupSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }

        const { username, password } = result.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            username: username,
            password: hashedPassword,
        });

        return res.status(200).json({
            success: true,
            message: "User signed up",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User already exists",
        });
    }
});

app.post("/api/v1/signin", async (req, res) => {
    try {
        const result = signinSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }

        const { username, password } = result.data;

        const existingUser = await UserModel.findOne({ username: username });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User doesnot exists",
            });
        }
        const match = await bcrypt.compare(password, existingUser.password);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Password doesnot match",
            });
        }

        const jwtToken = jwt.sign({ id: existingUser._id }, jwtPassword, {
            expiresIn: "7d",
        });

        return res.status(200).json({
            success: true,
            message: "User signed successfully",
            jwtToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while signing up",
        });
    }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const result = createContentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error,
        });
    }
    const { link, title } = result.data;

    await ContentModel.create({
        link,
        title,
        //@ts-ignore
        userId: req.userId,
        tags: [],
    });

    return res.status(200).json({
        success: true,
        message: "Content added",
    });
});

app.get(
    "/api/v1/content",
    userMiddleware,
    async (req: Request, res: Response) => {
        //@ts-ignore
        const userId = req.userId;
        const content = await ContentModel.findOne({ userId: userId })
            .populate("userId", "username")
            .exec();

        return res.status(200).json({
            success: true,
            message: "Content has been fetched successfully",
            content,
        });
    },
);

app.delete("/api/v1/content", async (req, res) => {
    const result = deleteContentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error,
        });
    }

    const { contentId } = result.data;

    await ContentModel.deleteOne({
        contentId,
        //@ts-ignore
        userId: req.userId,
    });

    return res.status(200).json({
        success: true,
        message: "Content deleted successfully",
    });
});

app.post("/api/v1/brain/share", async (req: Request, res: Response) => {});

app.post("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {});
app.listen(3000);
