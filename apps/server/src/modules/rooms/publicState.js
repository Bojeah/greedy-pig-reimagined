import { currentPlayerId } from '../game/engine.js';

// The ONLY shape we ever send to browsers. Never send the internal room object.
export function publicState(room) {
  const game = room.game;
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      isGuest: p.isGuest,
      pigIndex: p.pigIndex,
      connected: p.connected,
      score: game ? (game.scores[p.userId] ?? 0) : 0,
    })),
    settings: room.settings,
    game: game
      ? {
          currentPlayerId: game.winnerId ? null : currentPlayerId(game),
          turnTotal: game.turnTotal,
          lastRoll: game.lastRoll,
          turnEndsAt: room.turnEndsAt ? room.turnEndsAt.toISOString() : null,
          version: game.version,
          winnerId: game.winnerId,
        }
      : null,
    serverTime: new Date().toISOString(),
  };
}

// A smaller version for GET /api/rooms/:code
export function publicRoomInfo(room) {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      pigIndex: p.pigIndex,
      connected: p.connected,
    })),
    settings: room.settings,
  };
}
