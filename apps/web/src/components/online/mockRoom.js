// Fake data shaped exactly like the server's room:state message.
// Used only while building the screens. Deleted when the live socket is connected.
const now = () => new Date().toISOString();

const players = [
  { userId: 'me', username: 'you', isGuest: false, pigIndex: 0, connected: true, score: 34 },
  { userId: 'u2', username: 'bola', isGuest: false, pigIndex: 1, connected: true, score: 21 },
  { userId: 'u3', username: 'chidi', isGuest: true, pigIndex: 2, connected: false, score: 8 },
];

const settings = { targetScore: 100, maxPlayers: 4, turnSeconds: 30 };

export const MOCK_ME = 'me';

export const mockLobby = () => ({
  code: 'K7MQ2',
  status: 'LOBBY',
  hostId: 'me',
  players: players.map((p) => ({ ...p, score: 0 })),
  settings,
  game: null,
  serverTime: now(),
});

export const mockPlaying = () => ({
  code: 'K7MQ2',
  status: 'PLAYING',
  hostId: 'me',
  players,
  settings,
  game: {
    currentPlayerId: 'me',
    turnTotal: 9,
    lastRoll: 4,
    turnEndsAt: new Date(Date.now() + 22000).toISOString(),
    version: 14,
    winnerId: null,
  },
  serverTime: now(),
});

export const mockGameOver = {
  winnerId: 'me',
  results: [
    { userId: 'me', username: 'you', finalScore: 102, placement: 1 },
    { userId: 'u2', username: 'bola', finalScore: 64, placement: 2 },
  ],
  progression: [
    { userId: 'me', xpGained: 50, level: 2, leveledUp: true, newAchievements: [{ key: 'FIRST_WIN', name: 'First Win' }] },
  ],
};