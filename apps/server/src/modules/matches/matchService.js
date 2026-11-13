import { prisma } from "../../db/prisma.js";
import { invalidateLeaderboard } from "../../cache/leaderboardCache.js";
import { applyProgression } from "../progression/progressionService.js";
import { updateStats } from "../stats/statsService.js";
// Called when the host starts the game. Returns the new match id.
export async function createMatch(room) {
  const match = await prisma.match.create({
    data: {
      roomCode: room.code,
      targetScore: room.settings.targetScore,
      players: { create: room.players.map((p) => ({ userId: p.userId })) },
    },
  });
  return match.id;
}

// Called when fewer than 2 players are left. Nobody gets XP.
export async function abandonMatch(matchId) {
  await prisma.match.updateMany({
    where: { id: matchId, status: "IN_PROGRESS" },
    data: { status: "ABANDONED", endedAt: new Date() },
  });
}
// Saves a finished match. Everything happens in ONE transaction: either all of it is
// saved, or none of it is.
// results: [{ userId, username, isGuest, finalScore, placement, isWinner, bestTurnScore }]
// events:  [{ turnNumber, userId, action, roll, turnTotal }]
export async function finishMatch({ matchId, results, events }) {
  // A match counts (XP, stats, leaderboard) only if 2 or more registered players took part.
  const counted = results.filter((r) => !r.isGuest).length >= 2;
  const winner = results.find((r) => r.isWinner);

  const outcome = await prisma.$transaction(
    async (tx) => {
      // Step 1: claim the match. The condition status = IN_PROGRESS means that if this code
      // runs twice for the same match, the second run changes 0 rows and stops here,
      // so nobody is paid twice.
      const claimed = await tx.match.updateMany({
        where: { id: matchId, status: 'IN_PROGRESS' },
        data: { status: 'FINISHED', endedAt: new Date(), winnerId: winner?.userId ?? null },
      });
      if (claimed.count !== 1) return { alreadyFinished: true, progression: [] };

      // Step 2: save the scores and the roll-by-roll record.
      for (const r of results) {
        await tx.matchPlayer.update({
          where: { matchId_userId: { matchId, userId: r.userId } },
          data: { finalScore: r.finalScore, placement: r.placement, isWinner: r.isWinner },
        });
      }
      if (events.length > 0) {
        await tx.matchEvent.createMany({ data: events.map((e) => ({ matchId, ...e })) });
      }

      // Step 3: stats first, then XP and achievements (achievements read the stats).
      let progression = [];
      if (counted) {
        await updateStats(tx, results);
        progression = await applyProgression(tx, results);
      }
      return { alreadyFinished: false, progression };
    },
    { timeout: 15000 }
  );

  // Step 4: only after the transaction has committed.
  if (!outcome.alreadyFinished && counted) invalidateLeaderboard();
  return outcome;
}
