import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types/types.js";
import type { AuthIdentity } from "../authorization/types.js";

/**
 * Authentication: verifies JWT and attaches identity only (id, email).
 * Permissions are resolved separately via organization authorization middleware.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtUserPayload;

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Missing required user id.",
      });
    }

    const identity: AuthIdentity = {
      id: decoded.id,
      email: decoded.email,
    };

    req.user = identity;
    return next();
  } catch (error: unknown) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

/** @deprecated Use `authenticate` — kept for gradual migration. */
export const authenticateToken = authenticate;
