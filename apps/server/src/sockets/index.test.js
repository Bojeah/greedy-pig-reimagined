import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { io as Client } from 'socket.io-client';
import { app } from '../app.js';
import { issueToken } from '../middleware/auth.js';
import { createRoom, getRoom } from '../modules/rooms/roomStore.js';
import { joinRoom } from '../modules/rooms/roomService.js';
import { attachSockets } from './index.js';

const waitFor = (fn, timeoutMs = 5000) => new Promise((resolve, reject) => {
  const start = Date.now();
  const tick = () => {
    try {
      const result = fn();
      if (result) return resolve(result);
    } catch (err) {
      return reject(err);
    }
    if (Date.now() - start > timeoutMs) return reject(new Error('Timed out waiting for condition'));
    setTimeout(tick, 20);
  };
  tick();
});

test('socket server lets players join a room and start a game', async () => {
  const server = http.createServer(app);
  attachSockets(server);
  await new Promise((resolve) => server.listen(0, resolve));

  const port = server.address().port;
  const hostToken = issueToken({ id: 'u-1', username: 'host', isGuest: true });
  const guestToken = issueToken({ id: 'u-2', username: 'guest', isGuest: true });

  const hostSocket = Client(`http://localhost:${port}`, { auth: { token: hostToken }, transports: ['websocket'] });
  const guestSocket = Client(`http://localhost:${port}`, { auth: { token: guestToken }, transports: ['websocket'] });

  try {
    const room = createRoom({ hostId: 'u-1', settings: { targetScore: 25, maxPlayers: 2, turnSeconds: 30 } });
    joinRoom(room, { id: 'u-2', username: 'guest', isGuest: true }, 'guest-socket');

    const joinState = await new Promise((resolve, reject) => {
      const onConnect = () => {
        hostSocket.emit('room:join', { code: room.code });
        guestSocket.emit('room:join', { code: room.code });
      };
      hostSocket.once('connect', onConnect);
      guestSocket.once('connect', onConnect);
      hostSocket.once('room:state', resolve);
      guestSocket.once('room:state', resolve);
      hostSocket.once('connect_error', reject);
      guestSocket.once('connect_error', reject);
    });

    assert.equal(joinState.code, room.code);

    const startState = await new Promise((resolve, reject) => {
      hostSocket.emit('room:start');
      hostSocket.once('room:state', (state) => {
        if (state.status === 'PLAYING') resolve(state);
      });
      hostSocket.once('error:message', reject);
      setTimeout(() => reject(new Error('room:start did not start the game')), 2000);
    });

    assert.equal(startState.status, 'PLAYING');
    assert.equal(getRoom(room.code).status, 'PLAYING');
  } finally {
    hostSocket.close();
    guestSocket.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
