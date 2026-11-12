import test from "node:test";
import assert from "node:assert/strict";
import { levelFromXp, levelProgress, xpForLevel } from "./levels.js";
test("xpForLevel follows 50 * n * (n - 1)", () => {
  assert.equal(xpForLevel(1), 0);
  assert.equal(xpForLevel(2), 100);
  assert.equal(xpForLevel(3), 300);
  assert.equal(xpForLevel(5), 1000);
});
test("levelFromXp finds the highest level reached", () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2);
  assert.equal(levelFromXp(299), 2);
  assert.equal(levelFromXp(300), 3);
  assert.equal(levelFromXp(1000), 5);
});
test("levelProgress gives the numbers for the XP bar", () => {
  assert.deepEqual(levelProgress(150), {
    level: 2,
    xpIntoLevel: 50,
    xpForNextLevel: 200,
  });
  assert.deepEqual(levelProgress(0), {
    level: 1,
    xpIntoLevel: 0,
    xpForNextLevel: 100,
  });
});
