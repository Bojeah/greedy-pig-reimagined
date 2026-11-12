import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "./errorHandler.js";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
}

// Returns the user for a token, or null if the token is missing, bad or expired.
export async function userFromToken(token) {
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
  return prisma.user.findUnique({ where: { id: payload.sub } });
}

// Put this on any route that needs a logged-in player (guests count as logged in).
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Please log in to continue.");
  }
  const user = await userFromToken(token);
  if (!user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Your session has expired. Please log in again.",
    );
  }
  req.user = user;
  next();
}
