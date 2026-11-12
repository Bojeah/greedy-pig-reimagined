// Fills the database with demo players and matches so the leaderboard is not empty.
//   npm run seed            demo data (safe for any database)
//   npm run seed -- --bulk  adds about 100,000 matches to test query speed. DEV DATABASE ONLY.
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db/prisma.js";
import { levelFromXp } from "../src/modules/progression/levels.js";

const NAMES = [
  "ada",
  "bola",
  "chidi",
  "dayo",
  "emeka",
  "funke",
  "gbenga",
  "hauwa",
  "ife",
  "jide",
  "kemi",
  "lanre",
];

async function seedDemo() {
  if (await prisma.user.findUnique({ where: { username: "demo_ada" } })) {
    console.log("Demo data is already there. Nothing to do.");
    return;
  }
  const passwordHash = await bcrypt.hash("demo12345", 10);
  const users = [];

  for (const [i, name] of NAMES.entries()) {
    const wins = 12 - i;
    const gamesPlayed = wins + 3 + i;
    const xp = wins * 50 + (gamesPlayed - wins) * 20;
    const user = await prisma.user.create({
      data: {
        username: `demo_${name}`,
        passwordHash,
        xp,
        level: levelFromXp(xp),
      },
    });
    await prisma.userStats.create({
      data: {
        userId: user.id,
        gamesPlayed,
        wins,
        highestTurnScore: 15 + i * 2,
        highestGameScore: 100 + i,
      },
    });
    users.push(user);
  }

  // 40 finished matches between random pairs, so history pages have something to show.
  for (let i = 0; i < 40; i++) {
    const a = users[Math.floor(Math.random() * users.length)];
    let b = users[Math.floor(Math.random() * users.length)];
    while (b.id === a.id) b = users[Math.floor(Math.random() * users.length)];
    await prisma.match.create({
      data: {
        roomCode: "DEMO1",
        status: "FINISHED",
        targetScore: 100,
        endedAt: new Date(Date.now() - i * 3600 * 1000),
        winnerId: a.id,
        players: {
          create: [
            {
              userId: a.id,
              finalScore: 100 + Math.floor(Math.random() * 6),
              placement: 1,
              isWinner: true,
            },
            {
              userId: b.id,
              finalScore: 40 + Math.floor(Math.random() * 55),
              placement: 2,
            },
          ],
        },
      },
    });
  }
  console.log("Seeded 12 demo players (password: demo12345) and 40 matches.");
}

async function seedBulk() {
  const userIds = [];
  const users = [];
  for (let i = 0; i < 1000; i++) {
    const id = randomUUID();
    userIds.push(id);
    users.push({ id, username: `bulk_${i}_${id.slice(0, 6)}` });
  }
  await prisma.user.createMany({ data: users });
  await prisma.userStats.createMany({
    data: userIds.map((userId, i) => ({
      userId,
      gamesPlayed: 3 + (i % 50),
      wins: i % 30,
    })),
  });

  for (let batch = 0; batch < 20; batch++) {
    const matches = [];
    const players = [];
    for (let i = 0; i < 5000; i++) {
      const id = randomUUID();
      const a = userIds[Math.floor(Math.random() * userIds.length)];
      let b = userIds[Math.floor(Math.random() * userIds.length)];
      while (b === a) b = userIds[Math.floor(Math.random() * userIds.length)];
      matches.push({
        id,
        roomCode: "BULK1",
        status: "FINISHED",
        targetScore: 100,
        endedAt: new Date(),
      });
      players.push(
        {
          matchId: id,
          userId: a,
          finalScore: 100,
          placement: 1,
          isWinner: true,
        },
        {
          matchId: id,
          userId: b,
          finalScore: Math.floor(Math.random() * 90),
          placement: 2,
        },
      );
    }
    await prisma.match.createMany({ data: matches });
    await prisma.matchPlayer.createMany({ data: players });
    console.log(`Inserted ${(batch + 1) * 5000} bulk matches`);
  }
}

try {
  if (process.argv.includes("--bulk")) await seedBulk();
  else await seedDemo();
} finally {
  await prisma.$disconnect();
}
