import { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { isProduction } from "../config/env";
import { AppError, isAppError } from "../utils/http-error";

interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
  stack?: string;
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const normalizeError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new AppError("Validation failed", 400, Object.values(error.errors).map((err) => err.message));
  }

  if (error instanceof mongoose.Error.CastError) {
    return new AppError("Invalid resource identifier", 400);
  }

  if (error instanceof mongoose.Error.StrictModeError) {
    return new AppError(error.message, 400);
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    return new AppError("Duplicate value already exists", 409);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400
  ) {
    return new AppError("Invalid request body", 400);
  }

  return new AppError("Internal server error", 500);
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode;
  const response: ApiErrorResponse = {
    success: false,
    message:
      statusCode >= 500 && isProduction
        ? "Internal server error"
        : normalizedError.message
  };

  if (normalizedError.details) {
    response.details = normalizedError.details;
  }

  if (!isProduction && normalizedError.stack) {
    response.stack = normalizedError.stack;
  }

  res.status(statusCode).json(response);
};
