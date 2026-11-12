// The list lives in code. Only the unlocks are stored in the database.
// Each check receives: { stats, level, won, margin } measured AFTER the match was recorded.
export const ACHIEVEMENTS = [
  {
    key: "FIRST_WIN",
    name: "First Win",
    description: "Win your first match.",
    check: (ctx) => ctx.stats.wins >= 1,
  },
  {
    key: "THREE_WINS",
    name: "Hat Trick",

    description: "Win 3 matches.",
    check: (ctx) => ctx.stats.wins >= 3,
  },
  {
    key: "TEN_GAMES",
    name: "Regular",
    description: "Play 10 matches.",
    check: (ctx) => ctx.stats.gamesPlayed >= 10,
  },
  {
    key: "PIG_OUT",
    name: "Pig Out",
    description: "Score 25 or more points in a single turn.",
    check: (ctx) => ctx.stats.highestTurnScore >= 25,
  },
  {
    key: "CLOSE_CALL",
    name: "Close Call",
    description: "Win a match by 5 points or fewer.",
    check: (ctx) => ctx.won && ctx.margin !== null && ctx.margin <= 5,
  },
  {
    key: "LEVEL_5",
    name: "Big Pig",
    description: "Reach level 5.",
    check: (ctx) => ctx.level >= 5,
  },
];
// Which achievements does this player newly earn, given what they already have?
export function newlyUnlocked(alreadyUnlockedKeys, ctx) {
  const have = new Set(alreadyUnlockedKeys);
  return ACHIEVEMENTS.filter((a) => !have.has(a.key) && a.check(ctx));
}
