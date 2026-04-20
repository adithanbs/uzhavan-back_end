import { Request, RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/http-error";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const hits = new Map<string, RateLimitEntry>();
let requestCount = 0;

const getClientKey = (req: Request) => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

const sweepExpiredEntries = (now: number) => {
  requestCount += 1;

  if (requestCount % 100 !== 0) {
    return;
  }

  for (const [key, entry] of hits.entries()) {
    if (entry.resetAt <= now) {
      hits.delete(key);
    }
  }
};

export const rateLimiter: RequestHandler = (req, res, next) => {
  const now = Date.now();
  sweepExpiredEntries(now);

  const key = getClientKey(req);
  const current = hits.get(key);

  if (!current || current.resetAt <= now) {
    hits.set(key, {
      count: 1,
      resetAt: now + env.RATE_LIMIT_WINDOW_MS
    });
    next();
    return;
  }

  current.count += 1;

  if (current.count > env.RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    next(new AppError("Too many requests. Please try again later.", 429));
    return;
  }

  next();
};
