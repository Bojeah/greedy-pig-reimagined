import { Router } from "express";
import { getLeaderboard } from "./leaderboardService.js";

const router = Router();

router.get("/", async (req, res) => {
  const requested = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requested)
    ? 20
    : Math.min(Math.max(requested, 1), 100);
  res.json({ entries: await getLeaderboard(limit) });
});

export default router;
