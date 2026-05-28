import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import multer from "multer";
import { logError, sendError } from "../utils/errorHandling.js";

const formatZodIssues = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
  issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // If a controller already sent a response, don't double-send.
  if (res.headersSent) return;

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodIssues(err.issues),
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: (e as any).path,
      message: (e as any).message,
    }));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, "Invalid id");
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, 413, "File too large (max 10MB)");
    }
    return sendError(res, 400, err.message);
  }

  if (err instanceof Error && err.message === "CORS_ORIGIN_NOT_ALLOWED") {
    return sendError(res, 403, "CORS origin not allowed");
  }

  // Custom fileFilter errors often come as plain Error.
  if (err instanceof Error && err.message.startsWith("UPLOAD_")) {
    const msg = err.message
      .replace(/^UPLOAD_/, "")
      .replace(/_/g, " ")
      .toLowerCase();
    return sendError(res, 400, msg.charAt(0).toUpperCase() + msg.slice(1));
  }

  logError("unhandled", err);
  return sendError(res, 500, "Server error");
};

