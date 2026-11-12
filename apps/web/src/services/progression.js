// Shows XP, level up and achievement messages after a match.
// `progression` is the array from the server's game:over message.
export function showProgressionToasts(toast, progression, myUserId) {
const mine = (progression || []).find((p) => p.userId === myUserId);
if (!mine) return;
toast.success(`+${mine.xpGained} XP`);
if (mine.leveledUp) toast.success(`Level up! You are now level
${mine.level}.`);
for (const achievement of mine.newAchievements) {
toast.success(`Achievement unlocked: ${achievement.name}`);
}
}
