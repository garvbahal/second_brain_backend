import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtPassword } from "./config.js";

export const userMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const header = req.headers["authorization"];
        if(!header){
            return res.status(400).json({
                success:false,
                message:"Authorization header is missing"
            })
        }
        const decoded = jwt.verify(header as string, jwtPassword);

        if (decoded) {
            if (typeof decoded !== "string" && "id" in decoded) {
                req.userId = String(decoded.id);
                return next();
            }
        }
        return res.status(403).json({
            success: false,
            message: "You are not logged in",
        });
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "You are not logged in",
        });
    }
};
