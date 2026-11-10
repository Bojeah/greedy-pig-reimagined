// Plays a whole online game with two bot players, so you can test the server without a browser.
// 1. Start the server:  npm run dev   (in another terminal)
// 2. Run this:          node scripts/socket-demo.js
//    To test XP and the leaderboard use registered players:  $env:DEMO_REGISTER="1"; node scripts/socket-demo.js

import { io } from 'socket.io-client';

const BASE = process.env.DEMO_URL || 'http://localhost:4000';

async function api(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} failed: ${data.error?.message}`);
  return data;
}

async function newPlayer() {
  if (process.env.DEMO_REGISTER) {
    const name = `bot_${Math.random().toString(36).slice(2, 8)}`;
    return api('/api/auth/register', { username: name, password: 'password123' });
  }
  return api('/api/auth/guest');
}

const [p1, p2] = await Promise.all([newPlayer(), newPlayer()]);
const { code } = await api('/api/rooms', { targetScore: 30, maxPlayers: 2, turnSeconds: 30 }, p1.token);
console.log('Room created:', code);

let finished = 0;

function bot(session, name) {
  const socket = io(BASE, { auth: { token: session.token }, transports: ['websocket'] });
  let state = null;
  const act = () => {
    if (!state || state.status !== 'PLAYING') return;
    if (state.game.currentPlayerId !== session.user.id) return;
    setTimeout(() => socket.emit(state.game.turnTotal >= 8 ? 'game:bank' : 'game:roll'), 150);
  };

  socket.on('connect', () => socket.emit('room:join', { code }));
  socket.on('room:state', (s) => {
    state = s;
    act();
  });
  socket.on('game:event', (e) => console.log(`[${name}]`, e.type, e.playerId === session.user.id ? 'me' : 'them', e.value));
  socket.on('error:message', (e) => {
    console.log(`[${name}] ERROR`, e.code, e.message);
    setTimeout(act, 400);
  });
  socket.on('game:over', (o) => {
    console.log(`[${name}] GAME OVER`, JSON.stringify(o.results));
    if (name === 'bot1') console.log('Progression:', JSON.stringify(o.progression));
    socket.close();
    finished += 1;
    if (finished === 2) process.exit(0);
  });

  return { socket, getState: () => state };
}

const a = bot(p1, 'bot1');
const b = bot(p2, 'bot2');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
while ((a.getState()?.players.length ?? 0) < 2) await wait(100);
a.socket.emit('room:start');
await wait(60000);
process.exit(0);
