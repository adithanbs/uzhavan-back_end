import { NextFunction, Request, Response } from "express";

const requests = new Map<string, { count: number; startTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();

  const existing = requests.get(ip);

  if (!existing) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (now - existing.startTime > WINDOW_MS) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (existing.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later."
    });
  }

  existing.count += 1;
  next();
};