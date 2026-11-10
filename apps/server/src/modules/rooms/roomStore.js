import { generateRoomCode } from './roomCodes.js';

// All live rooms are kept in memory. If the server restarts, live rooms are lost.
// Finished matches are safe, because they are saved to the database.
const rooms = new Map();

export function createRoom({ hostId, settings }) {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();

  const now = Date.now();
  const room = {
    code,
    hostId,
    settings,
    status: 'LOBBY',
    players: [],
    roster: [],
    game: null,
    matchId: null,
    events: [],
    result: null,
    turnEndsAt: null,
    turnTimer: null,
    timerSeq: 0,
    queue: Promise.resolve(),
    createdAt: now,
    updatedAt: now,
    finishedAt: null,
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code);
}

export function allRooms() {
  return [...rooms.values()];
}

export function touch(room) {
  room.updatedAt = Date.now();
}

export function removeRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  clearTimeout(room.turnTimer);
  for (const player of room.players) clearTimeout(player.disconnectTimer);
  rooms.delete(code);
}
