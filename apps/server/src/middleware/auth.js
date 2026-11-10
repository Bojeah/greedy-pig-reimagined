import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

export async function userFromToken(token) {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return {
      id: payload.id,
      username: payload.username,
      isGuest: Boolean(payload.isGuest),
    };
  } catch {
    return null;
  }
}

export function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isGuest: user.isGuest,
    },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const user = await userFromToken(token);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'You must be logged in.');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
