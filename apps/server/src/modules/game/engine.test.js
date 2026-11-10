import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bank,
  createGame,
  currentPlayerId,
  GameError,
  placements,
  removePlayer,
  roll,
} from './engine.js';

const dice = (...values) => () => values.shift();

test('rolling 2 to 6 adds to the running points and keeps the turn', () => {
  const game = createGame(['a', 'b'], 100);
  const events = roll(game, 'a', dice(4));
  assert.equal(game.turnTotal, 4);
  assert.equal(currentPlayerId(game), 'a');
  assert.equal(events[0].type, 'ROLL');
});

test('rolling a 1 wipes the running points and passes the turn', () => {
  const game = createGame(['a', 'b'], 100);
  roll(game, 'a', dice(5));
  const events = roll(game, 'a', dice(1));
  assert.equal(events[0].type, 'BUST');
  assert.equal(game.turnTotal, 0);
  assert.equal(game.scores.a, 0);
  assert.equal(currentPlayerId(game), 'b');
});

test('banking adds the running points to the score and passes the turn', () => {
  const game = createGame(['a', 'b'], 100);
  roll(game, 'a', dice(6));
  roll(game, 'a', dice(3));
  bank(game, 'a');
  assert.equal(game.scores.a, 9);
  assert.equal(game.bestTurn.a, 9);
  assert.equal(currentPlayerId(game), 'b');
});

test('banking with 0 running points just passes the turn', () => {
  const game = createGame(['a', 'b'], 100);
  const events = bank(game, 'a');
  assert.equal(events[0].value, 0);
  assert.equal(currentPlayerId(game), 'b');
});

test('the game ends the instant banked + running points reach the target, without banking', () => {
  const game = createGame(['a', 'b'], 10);
  roll(game, 'a', dice(6));
  roll(game, 'a', dice(4));
  assert.equal(game.winnerId, 'a');
  assert.equal(game.scores.a, 10);
});

test('only the current player can act, and nobody can act after the game ends', () => {
  const game = createGame(['a', 'b'], 5);
  assert.throws(
    () => roll(game, 'b', dice(3)),
    (e) => e instanceof GameError && e.code === 'NOT_YOUR_TURN',
  );
  roll(game, 'a', dice(6));
  assert.equal(game.winnerId, 'a');
  assert.throws(
    () => bank(game, 'b'),
    (e) => e instanceof GameError && e.code === 'GAME_NOT_STARTED',
  );
});

test('placements list the winner first and then the rest by score', () => {
  const game = createGame(['a', 'b', 'c'], 25);
  game.scores.a = 18;
  game.scores.b = 12;
  game.scores.c = 9;
  game.winnerId = 'a';
  assert.deepEqual(
    placements(game).map((r) => r.userId),
    ['a', 'b', 'c'],
  );
});

test('removing a player keeps the turn order and clears the turn when it was the current player', () => {
  const game = createGame(['a', 'b', 'c'], 100);
  game.currentIndex = 2;
  game.turnTotal = 5;
  removePlayer(game, 'c');
  assert.deepEqual(game.order, ['a', 'b']);
  assert.equal(game.currentIndex, 0);
  assert.equal(game.turnTotal, 0);
});
