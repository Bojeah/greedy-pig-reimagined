import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AppError } from '../../middleware/errorHandler.js';
import { issueToken, requireAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { parseOrThrow } from '../../middleware/validate.js';

const users = new Map();

const usernamePattern = /^[a-zA-Z0-9_]{3,24}$/;

function toPublicUser(user) {
  return { id: user.id, username: user.username, isGuest: user.isGuest };
}

function ensureUniqueUsername(username) {
  for (const user of users.values()) {
    if (user.username.toLowerCase() === username.toLowerCase()) {
      throw new AppError(409, 'USERNAME_TAKEN', 'That username is already taken.');
    }
  }
}

function createGuestUser() {
  const username = `guest_${Math.random().toString(36).slice(2, 10)}`;
  const user = {
    id: randomUUID(),
    username,
    passwordHash: null,
    isGuest: true,
  };
  users.set(user.id, user);
  return user;
}

const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters.').max(24, 'Username must be 24 characters or fewer.').regex(usernamePattern, 'Usernames may only contain letters, numbers, and underscores.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.').max(128, 'Password is too long.'),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const router = Router();

router.use(authLimiter);

router.post('/guest', (req, res) => {
  const user = createGuestUser();
  res.json({ token: issueToken(user), user: toPublicUser(user) });
});

router.post('/register', async (req, res) => {
  const data = parseOrThrow(registerSchema, req.body);
  ensureUniqueUsername(data.username);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = {
    id: randomUUID(),
    username: data.username,
    passwordHash,
    isGuest: false,
  };
  users.set(user.id, user);
  res.status(201).json({ token: issueToken(user), user: toPublicUser(user) });
});

router.post('/login', async (req, res) => {
  const data = parseOrThrow(loginSchema, req.body);
  const match = [...users.values()].find((user) => user.username.toLowerCase() === data.username.toLowerCase() && !user.isGuest);
  if (!match || !(await bcrypt.compare(data.password, match.passwordHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'The username or password is incorrect.');
  }
  res.json({ token: issueToken(match), user: toPublicUser(match) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
