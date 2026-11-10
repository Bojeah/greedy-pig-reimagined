import { randomInt } from 'node:crypto';

// An error the player should see. The socket layer turns it into an `error:message` event.
export class GameError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// One six-sided die, rolled with a secure random source. Never Math.random.
export const rollDie = () => randomInt(1, 7);

export function createGame(playerIds, targetScore) {
  return {
    targetScore,
    order: [...playerIds],
    currentIndex: 0,
    scores: Object.fromEntries(playerIds.map((id) => [id, 0])),
    turnTotal: 0,
    lastRoll: null,
    turnNumber: 1,
    bestTurn: Object.fromEntries(playerIds.map((id) => [id, 0])),
    winnerId: null,
    version: 1,
  };
}

export function currentPlayerId(game) {
  return game.order[game.currentIndex];
}

function assertCanAct(game, playerId) {
  if (game.winnerId) {
    throw new GameError('GAME_NOT_STARTED', 'The game is already over.');
  }
  if (currentPlayerId(game) !== playerId) {
    throw new GameError('NOT_YOUR_TURN', "It's not your turn.");
  }
}

function endTurn(game) {
  game.currentIndex = (game.currentIndex + 1) % game.order.length;
  game.turnTotal = 0;
  game.turnNumber += 1;
}

// Rolls for a player. Changes `game` and returns the events to show.
export function roll(game, playerId, rollFn = rollDie) {
  assertCanAct(game, playerId);
  const value = rollFn();
  game.lastRoll = value;
  let events;
  if (value === 1) {
    // Rule 4: a 1 wipes the running points and passes the turn.
    events = [{ type: 'BUST', playerId, value, turnTotal: 0 }];
    endTurn(game);
  } else {
    // Rule 3: 2 to 6 is added to the running points.
    game.turnTotal += value;
    events = [{ type: 'ROLL', playerId, value, turnTotal: game.turnTotal }];
    // Rule 7: the game ends the instant banked + running points reach the target.
    if (game.scores[playerId] + game.turnTotal >= game.targetScore) {
      game.bestTurn[playerId] = Math.max(game.bestTurn[playerId], game.turnTotal);
      game.scores[playerId] += game.turnTotal;
      game.turnTotal = 0;
      game.winnerId = playerId;
    }
  }
  game.version += 1;
  return events;
}

// Rule 5: pass (bank) adds the running points to the total and passes the turn.
// Allowed even with 0 running points, exactly like the base game.
export function bank(game, playerId) {
  assertCanAct(game, playerId);
  const banked = game.turnTotal;
  game.scores[playerId] += banked;
  game.bestTurn[playerId] = Math.max(game.bestTurn[playerId], banked);
  const events = [{ type: 'BANK', playerId, value: banked, turnTotal: banked }];
  endTurn(game);
  game.version += 1;
  return events;
}

// Everyone who started the game, best first: the winner, then by score.
export function placements(game) {
  const ids = Object.keys(game.scores);
  ids.sort((a, b) => {
    if (a === game.winnerId) return -1;
    if (b === game.winnerId) return 1;
    return game.scores[b] - game.scores[a];
  });
  return ids.map((userId, index) => ({
    userId,
    finalScore: game.scores[userId],
    placement: index + 1,
  }));
}

// A player forfeits: take them out of the turn order. Their score stays for the results.
export function removePlayer(game, playerId) {
  const index = game.order.indexOf(playerId);
  if (index === -1) return;
  const wasCurrent = index === game.currentIndex;
  game.order.splice(index, 1);
  if (game.order.length === 0) return;
  if (index < game.currentIndex) game.currentIndex -= 1;
  if (wasCurrent) {
    game.currentIndex = game.currentIndex % game.order.length;
    game.turnTotal = 0;
    game.turnNumber += 1;
  }
  game.version += 1;
}
