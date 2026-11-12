import { newlyUnlocked } from "./achievements.js";
import { levelFromXp, XP_FOR_FINISHING, XP_FOR_WINNING } from "./levels.js";
// Called by finishMatch inside its database transaction, AFTER updateStats.
// `tx` is the transaction object. Use it for every query, never the global client.
// results: [{ userId, isGuest, finalScore, placement, isWinner, bestTurnScore }]
export async function applyProgression(tx, results) {
  const winner = results.find((r) => r.isWinner);
  const runnerUpBest = Math.max(
    0,
    ...results.filter((r) => !r.isWinner).map((r) => r.finalScore),
  );
  const margin = winner ? winner.finalScore - runnerUpBest : null;
  const output = [];
  for (const r of results.filter((x) => !x.isGuest)) {
    const xpGained = XP_FOR_FINISHING + (r.isWinner ? XP_FOR_WINNING : 0);
    const updated = await tx.user.update({
      where: { id: r.userId },
      data: { xp: { increment: xpGained } },
    });
    const previousLevel = updated.level;
    const level = levelFromXp(updated.xp);
    if (level !== previousLevel) {
      await tx.user.update({ where: { id: r.userId }, data: { level } });
    }
    const stats = (await tx.userStats.findUnique({
      where: {
        userId: r.userId,
      },
    })) ?? {
      wins: 0,
      gamesPlayed: 0,
      highestTurnScore: 0,
    };
    const unlockedRows = await tx.userAchievement.findMany({
      where: { userId: r.userId },
      select: { key: true },
    });
    const earned = newlyUnlocked(
      unlockedRows.map((row) => row.key),
      { stats, level, won: r.isWinner, margin: r.isWinner ? margin : null },
    );
    if (earned.length > 0) {
      await tx.userAchievement.createMany({
        data: earned.map((a) => ({ userId: r.userId, key: a.key })),
        skipDuplicates: true,
      });
    }
    output.push({
      userId: r.userId,
      xpGained,
      level,
      leveledUp: level > previousLevel,
      newAchievements: earned.map((a) => ({ key: a.key, name: a.name })),
    });
  }
  return output;
}
