import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const handler = (req, res) => {
  res.status(429).json({
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please wait a moment and try again.",
    },
  });
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: env.apiRateLimit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler,
});


export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: env.authRateLimit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler,
});
