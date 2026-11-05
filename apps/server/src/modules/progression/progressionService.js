export async function applyProgression(tx, results) {
  return results
    .filter((r) => !r.isGuest)
    .map((r) => ({
      userId: r.userId,
      xpGained: 0,
      level: 1,
      leveledUp: false,
      newAchievements: [],
    }));
}
