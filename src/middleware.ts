import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtPassword } from "./config.js";

export const userMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, jwtPassword);

    if (decoded) {
        // see why is this and how to solves it
        //@ts-ignore
        req.userId = decoded.id;
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "You are not logged in",
        });
    }
};
