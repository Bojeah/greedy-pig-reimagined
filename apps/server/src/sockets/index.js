import { Server } from "socket.io";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { env } from "../config/env.js";
import { userFromToken } from "../middleware/auth.js";
import * as realMatchService from "../modules/matches/matchService.js";
import { GameError } from "../modules/game/engine.js";
import {
  normaliseCode,
  ROOM_CODE_PATTERN,
} from "../modules/rooms/roomCodes.js";
import { getRoom } from "../modules/rooms/roomStore.js";
import * as rooms from "../modules/rooms/roomService.js";

function reportError(socket, err) {
  if (err instanceof GameError) {
    socket.emit("error:message", { code: err.code, message: err.message });
  } else if (err && typeof err.msBeforeNext === "number") {
    // rate-limiter-flexible rejects with an object that has msBeforeNext
    socket.emit("error:message", {
      code: "RATE_LIMITED",
      message: "Slow down a little and try again.",
    });
  } else {
    console.error(err);
    socket.emit("error:message", {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side. Please try again.",
    });
  }
}

// `deps` is only used by the tests. The real server calls attachSockets(server).
export function attachSockets(httpServer, deps = {}) {
  const lookupUser = deps.userFromToken ?? userFromToken;
  const io = new Server(httpServer, { cors: { origin: env.corsOrigins } });
  rooms.configure({
    io,
    matchService: deps.matchService ?? realMatchService,
    rollFn: deps.rollFn,
  });
  rooms.startCleanup();

  // Limits are per user, not per connection.
  const actionLimiter = new RateLimiterMemory({ points: 8, duration: 1 });
  const joinLimiter = new RateLimiterMemory({ points: 10, duration: 60 });
  const reactionLimiter = new RateLimiterMemory({ points: 3, duration: 5 });
  // Every connection must carry a valid login token.
  io.use(async (socket, next) => {
    try {
      const user = await lookupUser(socket.handshake.auth?.token);
      if (!user) return next(new Error("UNAUTHORIZED"));
      socket.data.user = {
        id: user.id,
        username: user.username,
        isGuest: user.isGuest,
      };
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    const currentRoom = () => {
      const room = getRoom(socket.data.roomCode);
      if (!room)
        throw new GameError("ROOM_NOT_FOUND", "You are not in a room.");
      return room;
    };

    // Wraps a handler with rate limiting and error reporting.
    const on = (event, limiter, handler) => {
      socket.on(event, async (payload) => {
        try {
          await limiter.consume(user.id);
          await handler(payload ?? {});
        } catch (err) {
          reportError(socket, err);
        }
      });
    };

    on("room:join", joinLimiter, async ({ code }) => {
      const normalised = normaliseCode(code);
      if (!ROOM_CODE_PATTERN.test(normalised)) {
        throw new GameError(
          "ROOM_NOT_FOUND",
          "That room code does not look right.",
        );
      }
      const room = getRoom(normalised);
      if (!room)
        throw new GameError("ROOM_NOT_FOUND", "No room with that code.");

      // Joining a different room means leaving the old one.
      const previous = socket.data.roomCode;
      if (previous && previous !== normalised) {
        socket.leave(previous);
        const oldRoom = getRoom(previous);
        if (oldRoom) await rooms.leaveRoom(oldRoom, user.id);
      }

      rooms.joinRoom(room, user, socket.id);
      socket.data.roomCode = normalised;
      socket.join(normalised);
      rooms.broadcastState(room);
      // A player who refreshed after the game ended gets the results again.
      if (room.result) socket.emit("game:over", room.result);
    });

    on("room:leave", actionLimiter, async () => {
      const room = currentRoom();
      socket.leave(room.code);
      socket.data.roomCode = null;
      await rooms.leaveRoom(room, user.id);
    });

    on("room:start", actionLimiter, async () => {
      await rooms.startGame(currentRoom(), user.id);
    });

    on("game:roll", actionLimiter, async () => {
      await rooms.playerRoll(currentRoom(), user.id);
    });

    on("game:bank", actionLimiter, async () => {
      await rooms.playerBank(currentRoom(), user.id);
    });
    on("room:react", reactionLimiter, async ({ emoji }) => {
      rooms.sendReaction(currentRoom(), user, emoji);
    });

    socket.on("disconnect", () => {
      const room = getRoom(socket.data.roomCode);
      if (room) rooms.handleDisconnect(room, user.id, socket.id);
    });
  });

  return io;
}
