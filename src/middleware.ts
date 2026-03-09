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
        if (typeof decoded !== "string" && "id" in decoded) {
            req.userId = String(decoded.id);
            next();
        }
    } else {
        return res.status(403).json({
            success: false,
            message: "You are not logged in",
        });
    }
};
