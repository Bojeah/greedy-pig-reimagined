// Called by finishMatch inside its database transaction, BEFORE applyProgression.
// results: [{ userId, isGuest, finalScore, placement, isWinner, bestTurnScore }]
export async function updateStats(tx, results) {
  for (const r of results.filter((x) => !x.isGuest)) {
    const stats = await tx.userStats.upsert({
      where: { userId: r.userId },
      create: {
        userId: r.userId,
        gamesPlayed: 1,
        wins: r.isWinner ? 1 : 0,
        highestTurnScore: r.bestTurnScore,
        highestGameScore: r.finalScore,
      },
      update: {
        gamesPlayed: { increment: 1 },
        wins: { increment: r.isWinner ? 1 : 0 },
      },
    });

    const highestTurnScore = Math.max(stats.highestTurnScore, r.bestTurnScore);
    const highestGameScore = Math.max(stats.highestGameScore, r.finalScore);
    if (
      highestTurnScore !== stats.highestTurnScore ||
      highestGameScore !== stats.highestGameScore
    ) {
      await tx.userStats.update({
        where: { userId: r.userId },
        data: { highestTurnScore, highestGameScore },
      });
    }
  }
}
