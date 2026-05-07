import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types/types.js";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload;

        if (!decoded.id || !decoded.email || !decoded.role) {
            return res.status(401).json({ message: "Invalid token. Missing required user information." });
        }

        req.user = decoded;
        next();
    } catch (error: unknown) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Invalid token." });
    }
};
