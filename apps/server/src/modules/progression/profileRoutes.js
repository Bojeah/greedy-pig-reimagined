import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { toPublicUser } from "../auth/authService.js";
import { ACHIEVEMENTS } from "./achievements.js";
import { levelProgress } from "./levels.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const rows = await prisma.userAchievement.findMany({
    where: { userId: req.user.id },
  });
  const unlockedAt = new Map(rows.map((row) => [row.key, row.unlockedAt]));

  res.json({
    user: { ...toPublicUser(req.user), ...levelProgress(req.user.xp) },
    achievements: ACHIEVEMENTS.map((a) => ({
      key: a.key,
      name: a.name,
      description: a.description,
      unlocked: unlockedAt.has(a.key),
      unlockedAt: unlockedAt.get(a.key) ?? null,
    })),
  });
});

export default router;
