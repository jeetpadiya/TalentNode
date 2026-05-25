import type { Response } from "express";

export type ApiErrorResponse = {
  success: false;
  message: string;
};

const formatErrorForLog = (error: unknown): { name?: string; message?: string; stack?: string } => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === "string") return { message: error };
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
};

export const logError = (context: string, error: unknown) => {
  // Intentionally do not attempt to expose full error details to clients.
  const formatted = formatErrorForLog(error);
  // Server-side log only
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, formatted);
};

export const sendError = (res: Response, statusCode: number, message: string) => {
  const body: ApiErrorResponse = { success: false, message };
  return res.status(statusCode).json(body);
};

