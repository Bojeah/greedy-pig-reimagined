import {
  bank,
  createGame,
  currentPlayerId,
  GameError,
  placements,
  roll,
} from "../game/engine.js";
import { allRooms, getRoom, removeRoom, touch } from "./roomStore.js";
import { publicState } from "./publicState.js";

let io = null;
let matchService = null;
let rollFn;

export function configure(deps) {
  io = deps.io;
  matchService = deps.matchService;
  rollFn = deps.rollFn;
}

function enqueue(room, task) {
  const run = room.queue.then(task);
  room.queue = run.catch(() => {});
  return run;
}

export function broadcastState(room) {
  io.to(room.code).emit("room:state", publicState(room));
}

function emitEvents(room, events) {
  for (const e of events) {
    io.to(room.code).emit("game:event", {
      type: e.type,
      playerId: e.playerId,
      value: e.value,
    });
  }
}

function recordEvents(room, turnNumber, events) {
  for (const e of events) {
    room.events.push({
      turnNumber,
      userId: e.playerId,
      action: e.type,
      roll: e.type === "ROLL" || e.type === "BUST" ? e.value : null,
      turnTotal: e.turnTotal,
    });
  }
}

export function joinRoom(room, user, socketId) {
  const existing = room.players.find((p) => p.userId === user.id);
  if (existing) {
    existing.socketId = socketId;
    existing.connected = true;
    clearTimeout(existing.disconnectTimer);
    existing.disconnectTimer = null;
    touch(room);
    return;
  }
  if (room.status !== "LOBBY") {
    throw new GameError(
      "GAME_ALREADY_STARTED",
      "That game has already started.",
    );
  }
  if (room.players.length >= room.settings.maxPlayers) {
    throw new GameError("ROOM_FULL", "That room is full.");
  }
  const used = new Set(room.players.map((p) => p.pigIndex));
  let pigIndex = 0;
  while (used.has(pigIndex)) pigIndex += 1;

  room.players.push({
    userId: user.id,
    username: user.username,
    isGuest: user.isGuest,
    pigIndex,
    connected: true,
    socketId,
    disconnectTimer: null,
  });
  touch(room);
}

export function startGame(room, userId) {
  return enqueue(room, async () => {
    if (room.hostId !== userId) {
      throw new GameError("FORBIDDEN", "Only the host can start the game.");
    }
    if (room.status !== "LOBBY") {
      throw new GameError(
        "GAME_ALREADY_STARTED",
        "The game has already started.",
      );
    }
    if (room.players.length < 2) {
      throw new GameError("FORBIDDEN", "You need at least 2 players to start.");
    }
    const game = createGame(
      room.players.map((p) => p.userId),
      room.settings.targetScore,
    );
    const matchId = await matchService.createMatch(room);
    room.roster = room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      isGuest: p.isGuest,
    }));
    room.game = game;
    room.matchId = matchId;
    room.events = [];
    room.status = "PLAYING";
    touch(room);
    armTurnTimer(room);
    broadcastState(room);
  });
}

export function playerRoll(room, userId) {
  return enqueue(room, () => act(room, (game) => roll(game, userId, rollFn)));
}

export function playerBank(room, userId) {
  return enqueue(room, () => act(room, (game) => bank(game, userId)));
}

async function act(room, doAction) {
  if (room.status !== "PLAYING" || !room.game) {
    throw new GameError("GAME_NOT_STARTED", "The game has not started yet.");
  }
  const turnNumber = room.game.turnNumber;
  const events = doAction(room.game);
  recordEvents(room, turnNumber, events);
  await afterAction(room, events);
}

async function afterAction(room, events) {
  touch(room);
  if (room.game.winnerId) {
    await finishGame(room, events);
    return;
  }
  armTurnTimer(room);
  broadcastState(room);
  emitEvents(room, events);
}

async function finishGame(room, lastEvents) {
  clearTimeout(room.turnTimer);
  room.turnTimer = null;
  room.turnEndsAt = null;
  room.status = "FINISHED";
  room.finishedAt = Date.now();
  broadcastState(room);
  emitEvents(room, lastEvents);

  const results = placements(room.game).map((r) => {
    const who = room.roster.find((p) => p.userId === r.userId);
    return {
      userId: r.userId,
      username: who.username,
      isGuest: who.isGuest,
      finalScore: r.finalScore,
      placement: r.placement,
      isWinner: r.userId === room.game.winnerId,
      bestTurnScore: room.game.bestTurn[r.userId],
    };
  });

  let progression = [];
  try {
    const outcome = await matchService.finishMatch({
      matchId: room.matchId,
      results,
      events: room.events,
    });
    progression = outcome.progression;
  } catch (err) {
    console.error("finishMatch failed:", err);
  }

  room.result = {
    winnerId: room.game.winnerId,
    results: results.map(({ userId, username, finalScore, placement }) => ({
      userId,
      username,
      finalScore,
      placement,
    })),
    progression,
  };
  io.to(room.code).emit("game:over", room.result);
}

function armTurnTimer(room) {
  clearTimeout(room.turnTimer);
  const ms = room.settings.turnSeconds * 1000;
  room.turnEndsAt = new Date(Date.now() + ms);
  room.timerSeq += 1;
  const token = room.timerSeq;
  room.turnTimer = setTimeout(() => {
    enqueue(room, () => onTurnTimeout(room, token)).catch((err) =>
      console.error(err),
    );
  }, ms);
}

async function onTurnTimeout(room, token) {
  if (room.status !== "PLAYING" || room.timerSeq !== token) return;
  const playerId = currentPlayerId(room.game);
  const turnNumber = room.game.turnNumber;
  const events = bank(room.game, playerId).map((e) => ({
    ...e,
    type: "TIMEOUT",
  }));
  recordEvents(room, turnNumber, events);
  await afterAction(room, events);
}

const GRACE_MS = 60 * 1000;
export const REACTIONS = ["🐷", "😂", "🔥", "👏", "😮", "😭"];

export async function leaveRoom(room, userId) {
  const player = room.players.find((p) => p.userId === userId);
  if (!player) return;
  if (room.status === "PLAYING") {
    await forfeitPlayer(room, userId);
    return;
  }
  clearTimeout(player.disconnectTimer);
  room.players = room.players.filter((p) => p.userId !== userId);
  if (room.players.length === 0) {
    removeRoom(room.code);
    return;
  }
  if (room.hostId === userId) room.hostId = room.players[0].userId;
  touch(room);
  broadcastState(room);
}

export function handleDisconnect(room, userId, socketId) {
  const player = room.players.find((p) => p.userId === userId);
  if (!player || player.socketId !== socketId) return;
  player.connected = false;
  player.socketId = null;
  clearTimeout(player.disconnectTimer);
  player.disconnectTimer = setTimeout(() => {
    leaveRoom(room, userId).catch((err) => console.error(err));
  }, GRACE_MS);
  touch(room);
  broadcastState(room);
}

function forfeitPlayer(room, userId) {
  return enqueue(room, async () => {
    if (room.status !== "PLAYING") return;
    const player = room.players.find((p) => p.userId === userId);
    if (!player) return;
    clearTimeout(player.disconnectTimer);
    const wasCurrent = currentPlayerId(room.game) === userId;
    room.players = room.players.filter((p) => p.userId !== userId);
    if (room.hostId === userId && room.players.length > 0)
      room.hostId = room.players[0].userId;
    removePlayer(room.game, userId);
    if (room.game.order.length < 2) {
      await abandonGame(room);
      return;
    }
    if (wasCurrent) armTurnTimer(room);
    touch(room);
    broadcastState(room);
  });
}

async function abandonGame(room) {
  clearTimeout(room.turnTimer);
  room.turnTimer = null;
  room.turnEndsAt = null;
  room.status = "FINISHED";
  room.finishedAt = Date.now();
  try {
    await matchService.abandonMatch(room.matchId);
  } catch (err) {
    console.error("abandonMatch failed:", err);
  }
  const results = [...room.roster]
    .sort((a, b) => room.game.scores[b.userId] - room.game.scores[a.userId])
    .map((p, index) => ({
      userId: p.userId,
      username: p.username,
      finalScore: room.game.scores[p.userId],
      placement: index + 1,
    }));
  room.result = { winnerId: null, results, progression: [], abandoned: true };
  broadcastState(room);
  io.to(room.code).emit("game:over", room.result);
}

export function sendReaction(room, user, emoji) {
  if (!room.players.some((p) => p.userId === user.id)) {
    throw new GameError("FORBIDDEN", "You are not in this room.");
  }
  if (!REACTIONS.includes(emoji)) {
    throw new GameError("FORBIDDEN", "That reaction is not allowed.");
  }
  io.to(room.code).emit("room:reaction", {
    userId: user.id,
    username: user.username,
    emoji,
  });
}

export function cleanupRooms(now = Date.now()) {
  for (const room of allRooms()) {
    const idle = now - room.updatedAt;
    const staleLobby = room.status === "LOBBY" && idle > 30 * 60 * 1000;
    const oldFinished =
      room.status === "FINISHED" &&
      now - (room.finishedAt ?? now) > 10 * 60 * 1000;
    const ghostGame =
      room.status === "PLAYING" &&
      room.players.every((p) => !p.connected) &&
      idle > 5 * 60 * 1000;
    if (staleLobby || oldFinished || ghostGame) removeRoom(room.code);
  }
}

export function startCleanup() {
  const timer = setInterval(cleanupRooms, 60 * 1000);
  timer.unref();
  return timer;
}

export function shutdownRooms() {
  for (const room of allRooms()) removeRoom(room.code);
}

function armTurnTimer(room) {
  clearTimeout(room.turnTimer);
  const ms = room.settings.turnSeconds * 1000;
  room.turnEndsAt = new Date(Date.now() + ms);
  room.timerSeq += 1;
  const token = room.timerSeq;
  room.turnTimer = setTimeout(() => {
    enqueue(room, () => onTurnTimeout(room, token)).catch((err) =>
      console.error(err),
    );
  }, ms);
}

async function onTurnTimeout(room, token) {
  // If anything re-armed the timer in the meantime, this timeout is out of date.
  if (room.status !== "PLAYING" || room.timerSeq !== token) return;
  const playerId = currentPlayerId(room.game);
  const turnNumber = room.game.turnNumber;
  const events = bank(room.game, playerId).map((e) => ({
    ...e,
    type: "TIMEOUT",
  }));
  recordEvents(room, turnNumber, events);
  await afterAction(room, events);
}

export { getRoom };
