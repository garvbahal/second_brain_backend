import express, { type Request, type Response } from "express";
const app = express();
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import bcrypt from "bcrypt";
app.use(express.json());

import { jwtPassword } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { signupSchema, signinSchema } from "./validators/auth.schema.js";
import {
    createContentSchema,
    deleteContentSchema,
} from "./validators/content.schema.js";
import { random } from "./utils.js";
import { seeShareLinkSchema } from "./validators/shareLink.schema.js";

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
    try {
        const result = createContentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }
        const { link, title } = result.data;
        if (!req.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not logged in",
            });
        }

        await ContentModel.create({
            link,
            title,
            userId: req.userId,
            tags: [],
        });

        return res.status(200).json({
            success: true,
            message: "Content added",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding content",
        });
    }
});

app.get(
    "/api/v1/content",
    userMiddleware,
    async (req: Request, res: Response) => {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(403).json({
                    success: false,
                    message: "You are not logged in",
                });
            }

            const content = await ContentModel.find({ userId: userId })
                .populate("userId", "username")
                .exec();

            return res.status(200).json({
                success: true,
                message: "Content has been fetched successfully",
                content,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong while fetching content",
            });
        }
    },
);

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    try {
        const result = deleteContentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }

        const { contentId } = result.data;

        if (!req.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not logged in",
            });
        }

        await ContentModel.deleteOne({
            _id: contentId,
            userId: req.userId,
        });

        return res.status(200).json({
            success: true,
            message: "Content deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting content",
        });
    }
});

app.post(
    "/api/v1/brain/share",
    userMiddleware,
    async (req: Request, res: Response) => {
        try {
            const { share } = req.body;

            if (!req.userId) {
                return res.status(403).json({
                    success: false,
                    message: "You are not logged in",
                });
            }
            if (share) {
                const existingLink = await LinkModel.findOne({
                    userId: req.userId,
                });

                if (existingLink) {
                    return res.status(200).json({
                        success: true,
                        hash: existingLink.hash,
                    });
                }
                await LinkModel.create({
                    userId: req.userId,
                    hash: random(10),
                });
            } else {
                await LinkModel.deleteOne({
                    userId: req.userId,
                });
            }
            return res.status(200).json({
                success: true,
                message: "Link updated successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong while updating the link",
            });
        }
    },
);

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
    try {
        const result = seeShareLinkSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error,
            });
        }

        const hash = result.data.shareLink;

        const link = await LinkModel.findOne({ hash: hash });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Link not found",
            });
        }

        const content = await ContentModel.find({
            userId: link.userId,
        });
 
        const user = await UserModel.findById(link.userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            username: user.username,
            content: content,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching shared content",
        });
    }
});
app.listen(3000);
