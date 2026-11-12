-- DropIndex
DROP INDEX "UserStats_wins_idx";

-- CreateIndex
CREATE INDEX "UserStats_wins_gamesPlayed_idx" ON "UserStats"("wins" DESC, "gamesPlayed" ASC);
