# Greedy Pig Reimagined

CSC 419, Pan-Atlantic University. Based on Greedy Pig by Hemephelus (https://github.com/Hemephelus/greed_pig).

## Team

| Name | Matric number | Role |
|---|---|---|
| Okocha-Ojeah Benedict | 23120111041 | BE-1: server, database, accounts, progression, leaderboard, hosting |
| Okoli Chidiebere | 23120111043 | BE-2: game engine, rooms, live play |
| Enujioke Chinekwu | 23120111018 | FE-1: login, profile, leaderboard, history screens |
| Ejekam Chukwunonye | 23120111016 | FE-2: online play screens |

## Live links

- Website: https://greedy-pig-reimagined.vercel.app/
- Server health check: https://greedy-pig-reimagined.onrender.com/api/health

The free server sleeps when idle, so the first request can take up to a minute.

## Our three improvements

1. Multiplayer and social: online rooms with a 5-letter code and invite link, a lobby, live turns, a turn timer, reconnecting after a refresh, and emoji reactions. (screenshot)
2. Progression: accounts and guest play, XP, levels, six achievements and a profile page. (screenshot)
3. Competition: a leaderboard, personal stats and rank, and match history. (screenshot)

## How it works

The browser only sends what a player wants to do (roll, pass). The server rolls the dice with a secure random source, keeps all scores, and checks whose turn it is, so players cannot cheat. Finished matches are saved to a PostgreSQL database in one transaction, which also awards XP, updates stats and unlocks achievements. Live rooms are kept in the server's memory and use Socket.IO.

## Course concepts, and where they are

| Concept | Where |
|---|---|
| Rate limiting | apps/server/src/middleware/rateLimit.js (HTTP), apps/server/src/sockets/index.js (game events) |
| Caching | apps/server/src/cache/leaderboardCache.js, and TanStack Query in the website |
| SQL optimization | Indexes in prisma/schema.prisma, keyset pagination in the history route, measurements in docs/performance.md |
| State management | Live game reducer in apps/web/src/context/onlineGameReducer.js, room state machine in apps/server/src/modules/rooms |
| Transactions | apps/server/src/modules/matches/matchService.js |
| Validation and security | zod schemas, bcrypt, JWT, helmet, CORS |

## Run it on your computer

You need Git and Node.js 22 or newer, and a PostgreSQL database (we use Supabase).

    git clone https://github.com/Bojeah/greedy-pig-reimagined.git
    cd greedy-pig-reimagined

Server:

    cd apps/server
    npm install
    copy .env.example .env      (then fill in the values)
    npx prisma migrate deploy
    npm run seed
    npm run dev

Website (in a second terminal):

    cd apps/web
    npm install
    (create .env.local containing VITE_API_URL=http://localhost:4000)
    npm run dev

Open the address the website prints, usually http://localhost:5173.

## Server settings (.env)

PORT, DATABASE_URL, DIRECT_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV, AUTH_RATE_LIMIT, API_RATE_LIMIT. See apps/server/.env.example for the format.

## Demo accounts

demo_ada and demo_bola, password demo12345.

## Docs

docs/REQUIREMENTS.md, docs/game-rules.md, docs/frontend-state.md, docs/deployment.md, docs/performance.md