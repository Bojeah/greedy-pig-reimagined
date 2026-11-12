import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import { signToken } from "../../middleware/auth.js";

export function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    isGuest: user.isGuest,
    xp: user.xp,
    level: user.level,
  };
}

function sessionFor(user) {
  return { token: signToken(user.id), user: toPublicUser(user) };
}

const TAKEN = "That username is already taken.";

export async function register({ username, password }) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new AppError(409, "CONFLICT", TAKEN);

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { username, passwordHash } });
    return sessionFor(user);
  } catch (err) {
    // Two people registered the same name at the same moment.
    if (err.code === "P2002") throw new AppError(409, "CONFLICT", TAKEN);
    throw err;
  }
}

export async function login({ username, password }) {
  const user = await prisma.user.findUnique({ where: { username } });
  const ok = user?.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false;
  // Same message for "no such user" and "wrong password", so nobody can probe for usernames.
  if (!ok)
    throw new AppError(401, "UNAUTHORIZED", "Invalid username or password.");
  return sessionFor(user);
}

export async function createGuest() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const username = `guest_${randomInt(10000, 100000)}`;
    try {
      const user = await prisma.user.create({
        data: { username, isGuest: true },
      });
      return sessionFor(user);
    } catch (err) {
      if (err.code !== "P2002") throw err;
    }
  }
  throw new AppError(
    500,
    "INTERNAL_ERROR",
    "Could not create a guest account. Please try again.",
  );
}
