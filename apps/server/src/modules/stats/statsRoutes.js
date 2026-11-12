import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { MIN_GAMES_FOR_LEADERBOARD } from "../leaderboard/leaderboardService.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const mine = await prisma.userStats.findUnique({
    where: { userId: req.user.id },
  });

  if (!mine) {
    return res.json({
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      highestTurnScore: 0,
      highestGameScore: 0,
      rank: null,
    });
  }

  let rank = null;
  if (mine.gamesPlayed >= MIN_GAMES_FOR_LEADERBOARD) {
    // Rank = 1 + the number of players ahead of me: more wins, or the same wins in fewer games.
    const ahead = await prisma.userStats.count({
      where: {
        gamesPlayed: { gte: MIN_GAMES_FOR_LEADERBOARD },
        user: { isGuest: false },
        OR: [
          { wins: { gt: mine.wins } },
          { wins: mine.wins, gamesPlayed: { lt: mine.gamesPlayed } },
        ],
      },
    });
    rank = ahead + 1;
  }

  res.json({
    gamesPlayed: mine.gamesPlayed,
    wins: mine.wins,
    winRate: Math.round((mine.wins / mine.gamesPlayed) * 100),
    highestTurnScore: mine.highestTurnScore,
    highestGameScore: mine.highestGameScore,
    rank,
  });
});

export default router;
