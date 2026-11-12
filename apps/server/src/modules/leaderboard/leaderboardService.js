import { prisma } from "../../db/prisma.js";
import { getCached } from "../../cache/leaderboardCache.js";

export const MIN_GAMES_FOR_LEADERBOARD = 3;

// Order: most wins first. With the same wins, fewer games played means a higher win rate.
export async function getLeaderboard(limit) {
  return getCached(`leaderboard:${limit}`, async () => {
    const rows = await prisma.userStats.findMany({
      where: {
        gamesPlayed: { gte: MIN_GAMES_FOR_LEADERBOARD },
        user: { isGuest: false },
      },
      orderBy: [
        { wins: "desc" },
        { gamesPlayed: "asc" },
        { user: { username: "asc" } },
      ],
      take: limit,
      include: { user: { select: { id: true, username: true, level: true } } },
    });

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      username: row.user.username,
      level: row.user.level,
      wins: row.wins,
      gamesPlayed: row.gamesPlayed,
      winRate: Math.round((row.wins / row.gamesPlayed) * 100),
    }));
  });
}
