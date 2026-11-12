import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

// Keyset pagination: we ask for one row more than we need. If it exists, there is a next page,
// and the last row we return becomes the cursor. This stays fast however deep the player scrolls,
// unlike OFFSET, which has to count past every skipped row.
router.get("/", requireAuth, async (req, res) => {
  const requested = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(requested)
    ? 10
    : Math.min(Math.max(requested, 1), 50);
  const cursor =
    typeof req.query.cursor === "string" && req.query.cursor
      ? req.query.cursor
      : null;

  const rows = await prisma.matchPlayer.findMany({
    where: { userId: req.user.id, match: { status: "FINISHED" } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    // One query that brings the match and all its players, instead of one query per match.
    include: {
      match: {
        include: {
          players: { include: { user: { select: { username: true } } } },
        },
      },
    },
  });

  const page = rows.slice(0, limit);

  res.json({
    matches: page.map((row) => ({
      id: row.match.id,
      endedAt: row.match.endedAt,
      targetScore: row.match.targetScore,
      myScore: row.finalScore,
      myPlacement: row.placement,
      won: row.isWinner,
      players: [...row.match.players]
        .sort((a, b) => (a.placement ?? 99) - (b.placement ?? 99))
        .map((p) => ({ username: p.user.username, finalScore: p.finalScore })),
    })),
    nextCursor: rows.length > limit ? page[page.length - 1].id : null,
  });
});

export default router;
