export const XP_FOR_FINISHING = 20;
export const XP_FOR_WINNING = 30;
// Total XP needed to reach level n: level 1 = 0, level 2 = 100, level 3 = 300, level 4 = 600...
export function xpForLevel(n) {
  return 50 * n * (n - 1);
}
export function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return level;
}
// Everything the profile page needs to draw an XP bar.
export function levelProgress(xp) {
  const level = levelFromXp(xp);
  return {
    level,
    xpIntoLevel: xp - xpForLevel(level),
    xpForNextLevel: 100 * level,
  };
}
