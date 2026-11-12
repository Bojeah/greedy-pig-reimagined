# Query performance

Tested on the dev database with about 100,000 matches (seed script, --bulk mode).

## Match history: where userId = X order by createdAt desc limit 11

| | Plan | Execution time |
|---|---|---|
| Without index on (userId, createdAt) | Seq Scan | ... ms |
| With the index | Index Scan | ... ms |

## Leaderboard: order by wins desc, gamesPlayed asc limit 20

| | Plan | Execution time |
|---|---|---|
| Index on wins only | ... | ... ms |
| Index on (wins desc, gamesPlayed asc) | ... | ... ms |

## What we learned

(Two or three sentences in your own words: what an index is, and why the plan changed.)

## Other optimizations in the code

- UserStats is a summary table updated when a match finishes, so the leaderboard reads one small table instead of counting every match.
- Match history uses keyset pagination (a cursor), not OFFSET.
- Match history loads matches and their players in one query, avoiding the N+1 problem.
- The leaderboard answer is cached for 30 seconds and cleared when a match finishes.