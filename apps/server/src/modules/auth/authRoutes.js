import { Router } from "express";
import { authLimiter } from "../../middleware/rateLimit.js";
import { requireAuth } from "../../middleware/auth.js";
import { parseOrThrow } from "../../middleware/validate.js";
import { loginSchema, registerSchema } from "./authSchemas.js";
import { createGuest, login, register, toPublicUser } from "./authService.js";
const router = Router();
router.post("/register", authLimiter, async (req, res) => {
  const input = parseOrThrow(registerSchema, req.body);
  res.status(201).json(await register(input));
});
router.post("/login", authLimiter, async (req, res) => {
  const input = parseOrThrow(loginSchema, req.body);
  res.json(await login(input));
});
router.post("/guest", authLimiter, async (req, res) => {
  res.status(201).json(await createGuest());
});
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});
export default router;
