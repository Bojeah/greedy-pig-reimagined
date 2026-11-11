import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { userFromToken } from '../middleware/auth.js';
import { GameError, rollDie } from '../modules/game/engine.js';
import { normaliseCode } from '../modules/rooms/roomCodes.js';
import { getRoom } from '../modules/rooms/roomStore.js';
import { publicState } from '../modules/rooms/publicState.js';
import {
  configure,
  handleDisconnect,
  joinRoom,
  leaveRoom,
  playerBank,
  playerRoll,
  sendReaction,
  startGame,
} from '../modules/rooms/roomService.js';
import { abandonMatch, createMatch, finishMatch } from '../modules/matches/matchService.js';

function emitError(socket, error) {
  const message = error instanceof Error ? error.message : String(error);
  socket.emit('error:message', message);
}

export function attachSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  configure({
    io,
    matchService: { createMatch, finishMatch, abandonMatch },
    rollFn: rollDie,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      const user = await userFromToken(token);
      if (!user) {
        return next(new Error('Unauthorized'));
      }
      socket.data.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const getRoomForSocket = () => {
      const code = socket.data.roomCode;
      if (!code) return null;
      return getRoom(normaliseCode(code));
    };

    socket.on('room:join', ({ code } = {}) => {
      try {
        const room = getRoom(normaliseCode(code));
        if (!room) {
          throw new GameError('ROOM_NOT_FOUND', 'No room with that code.');
        }
        joinRoom(room, socket.data.user, socket.id);
        socket.data.roomCode = room.code;
        socket.join(room.code);
        io.to(room.code).emit('room:state', publicState(room));
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('room:leave', async () => {
      const room = getRoomForSocket();
      if (!room) return;
      try {
        await leaveRoom(room, socket.data.user.id);
        socket.data.roomCode = null;
        socket.leave(room.code);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('room:start', async () => {
      const room = getRoomForSocket();
      if (!room) {
        emitError(socket, new GameError('ROOM_NOT_FOUND', 'Join a room before starting the game.'));
        return;
      }
      try {
        await startGame(room, socket.data.user.id);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('room:roll', async () => {
      const room = getRoomForSocket();
      if (!room) {
        emitError(socket, new GameError('ROOM_NOT_FOUND', 'Join a room before rolling.'));
        return;
      }
      try {
        await playerRoll(room, socket.data.user.id);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('room:bank', async () => {
      const room = getRoomForSocket();
      if (!room) {
        emitError(socket, new GameError('ROOM_NOT_FOUND', 'Join a room before banking.'));
        return;
      }
      try {
        await playerBank(room, socket.data.user.id);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('room:reaction', ({ emoji } = {}) => {
      const room = getRoomForSocket();
      if (!room) {
        emitError(socket, new GameError('ROOM_NOT_FOUND', 'Join a room before reacting.'));
        return;
      }
      try {
        sendReaction(room, socket.data.user, emoji);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('disconnect', () => {
      const room = getRoomForSocket();
      if (!room) return;
      try {
        handleDisconnect(room, socket.data.user.id, socket.id);
      } catch (error) {
        console.error(error);
      }
      socket.data.roomCode = null;
    });
  });

  return io;
}
