import test from "node:test";
import assert from "node:assert/strict";
import { newlyUnlocked } from "./achievements.js";
const base = {
  stats: { wins: 0, gamesPlayed: 1, highestTurnScore: 0 },
  level: 1,
  won: false,
  margin: null,
};
test("nothing unlocks on a plain loss", () => {
  assert.deepEqual(newlyUnlocked([], base), []);
});
test("a close win unlocks FIRST_WIN and CLOSE_CALL", () => {
  const ctx = {
    ...base,
    stats: { ...base.stats, wins: 1 },
    won: true,
    margin: 3,
  };
  assert.deepEqual(
    newlyUnlocked([], ctx).map((a) => a.key),
    ["FIRST_WIN", "CLOSE_CALL"],
  );
});
test("already unlocked achievements are not returned again", () => {
  const ctx = {
    ...base,
    stats: { ...base.stats, wins: 1 },
    won: true,
    margin: 40,
  };
  assert.deepEqual(newlyUnlocked(["FIRST_WIN"], ctx), []);
});
test("PIG_OUT and LEVEL_5 depend on stats and level", () => {
  const ctx = {
    ...base,
    stats: { ...base.stats, highestTurnScore: 25 },
    level: 5,
  };
  assert.deepEqual(
    newlyUnlocked([], ctx).map((a) => a.key),
    ["PIG_OUT", "LEVEL_5"],
  );
});
