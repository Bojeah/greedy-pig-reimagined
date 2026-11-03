# Greedy Pig Reimagined: Requirements

CSC 419, Advances in Web, Mobile and Blockchain Development. Group of four. Version 1.0, 29 October 2026. Deadline: Monday 16 November 2026.

This document says **what the product must do and how we will know it is done**. The Team Handbook says how we work, who owns what, and holds the technical contract (database schema, endpoints, socket events, XP numbers). Where this document needs a number or a message shape, it points to the handbook instead of repeating it, so there is only one place to change.

## 1. Purpose and scope

**Goal.** Turn the existing browser-only Greedy Pig into an online game with a real backend, three improvements from three different categories, deployed on the internet and demonstrated live in class.

**In scope**

1. Multiplayer and social: online rooms with a join code.
2. Progression: accounts, XP, levels and achievements.
3. Competition: leaderboard, match history and personal stats.
4. A deployed backend with a real database, validation and server-side dice and scores.
5. A user-friendly interface that works on phones and desktops.
6. A public GitHub repository with a README and a commit history that shows work over time.

**Out of scope** (do not build these, even if time is left)

- Computer opponents, blockchain, tournaments, in-game chat, friends lists, spectators.
- Email verification, password reset, social login, payments.
- Upgrading a guest into a registered account while keeping progress.
- Changing how the existing local pass-and-play mode plays. We only add navigation links to it.
- A native mobile app.

## 2. Starting point: what the base game does today

This section comes from reading the base project's source code, so it is a fact, not an assumption.

**Already there and not ours to claim as improvements:** local pass-and-play for 2 to 8 players on one device, player names and pig avatars, a maximum score (default 100, the setup input minimum is 25), a sound on and off switch, a how-to-play page, a game over screen with confetti, and layouts for mobile and desktop.

**The rules the base game implements:**

1. The game uses one six-sided die.
2. On a turn, a player rolls as many times as they like.
3. Rolling 2 to 6 adds that number to the player's **running points** for the turn, and the turn continues.
4. Rolling a **1** wipes the running points of that turn, and the turn passes to the next player. Banked points are kept.
5. **Pass** adds the running points to the player's **total points** and passes the turn. The game allows Pass at any time, even with 0 running points.
6. A player's displayed score is total points plus running points.
7. The game ends **the moment** a player's total plus running points reaches the maximum score. The player does not need to Pass first.

**Where the logic lives today:** entirely in the browser. The dice are chosen with `Math.random` in `components/Dice.jsx`. The scoring rules are in `routes/play_friends_live/game/components/DiceSection.jsx`, and the same logic is copied into `DiceSectionMobile.jsx`. The game state is a set of `useState` values in `routes/play_friends_live/LivePage.jsx`, shared through a context.

**Not present:** a server, a database, accounts, online play, or computer play. The `play_computer` folder holds one setup file that is not connected to anything, and `play_friend_remote` holds a single scratch file with an unfinished experiment and a hard-coded key. We do not build on either.

**Weaknesses we must not copy into the online game:** dice rolled in the browser (a player can cheat), scoring logic duplicated in two files, state changed in place, and no persistence at all.

## 3. Users

| User | What they need |
| --- | --- |
| Newcomer | Open the link on a phone and be playing in two taps, with no account and no instructions |
| Friend group | Two to four people on separate devices play the same game live, using a short code |
| Regular | An account that remembers their XP, level and achievements |
| Competitor | A leaderboard and stats that show how they compare |
| Examiner | A live demo that works, a repository with a readable history, and answers to questions about the code |

## 4. Rules of the online game

The online game follows the base rules in Section 2 exactly, with these additions. The server enforces all of them.

- **OR-1.** Only the current player can roll or pass. Anyone else gets the error `NOT_YOUR_TURN`.
- **OR-2.** The server rolls the die with a secure random source. The browser never sends a dice value or a score.
- **OR-3.** When a roll makes the player's total plus running points reach the target, the game ends immediately and that player wins.
- **OR-4.** Settings chosen by the host: target score 25 to 200 (default 100), players 2 to 4 (default 2), turn time 15 to 60 seconds (default 30).
- **OR-5.** If the turn timer runs out, the server passes for the player (so running points are banked, as if they pressed Pass) and tells everyone.
- **OR-6.** Each player gets a pig avatar by seat order. The display name is their username.

## 5. Functional requirements

Each requirement has an ID so we can test it, cite it in pull requests and answer demo questions with it. Numbers such as XP amounts and the exact endpoint names are in Section 5 of the handbook.

### 5.1 Multiplayer and social (improvement 1)

| ID | Requirement | How we check it |
| --- | --- | --- |
| MP-1 | A logged-in player or a guest can create a room and gets a 5-character code | Create a room as a guest and as a registered user, the code appears |
| MP-2 | Another player joins with the code, or by opening a share link | Join from a second device using each method |
| MP-3 | The lobby shows who is in the room. Only the host sees a Start button, enabled when at least 2 players are present | Check the lobby on both devices |
| MP-4 | Wrong code, full room and already-started room each show a clear, friendly message | Try all three |
| MP-5 | Everyone in the room sees the same game state within about one second of any action, when the server is awake | Play a turn and watch both screens |
| MP-6 | The turn timer is visible to everyone and the turn passes automatically when it ends | Wait out a turn |
| MP-7 | A player who refreshes or loses the connection and returns within 60 seconds rejoins the same game and sees the current state | Refresh a phone in the middle of a game |
| MP-8 | A player gone for more than 60 seconds forfeits. If fewer than two players remain, the match is abandoned and nobody gets XP | Close a tab and wait |
| MP-9 | When the game ends, every player sees the final ranking and their XP result | Finish a game |
| MP-10 | Abandoned and finished rooms are removed from the server | Check the server log over time |
| MP-11 | The server refuses any action that is not allowed (rolling out of turn, rolling after the game, starting as a non-host, sending a fake score) | Try each from the browser developer tools |

### 5.2 Progression (improvement 2)

| ID | Requirement | How we check it |
| --- | --- | --- |
| PR-1 | A player can register with a username and password, with validation messages for bad input and for a taken username | Try good and bad input |
| PR-2 | A player can log in and log out. A session lasts 7 days | Log in, close the browser, return |
| PR-3 | A player can play as a guest in one tap. Guests can play online but earn no XP and appear nowhere on the leaderboard | Play a game as a guest |
| PR-4 | Registered players earn XP and levels using the numbers in the handbook, only from a counted match | Finish a counted match and read the profile |
| PR-5 | There are six achievements, unlocked by the server and shown as locked or unlocked on the profile | Unlock one, open the profile |
| PR-6 | The end-of-game screen announces XP gained, a level up if it happened, and any new achievement | Finish a game that triggers each |
| PR-7 | XP and achievements are awarded exactly once per match, even if the server receives the finish twice | Automated test |
| PR-8 | Passwords are stored only as hashes. Login errors do not reveal whether the username exists | Inspect the database, try a wrong username and a wrong password |
| PR-9 | The profile shows level, an XP bar with progress to the next level, and the achievement list | Open the profile |

**A match counts** (for XP, stats and the leaderboard) only if it finished normally and at least two different registered players took part. Abandoned matches and matches with only one registered player do not count.

### 5.3 Competition (improvement 3)

| ID | Requirement | How we check it |
| --- | --- | --- |
| CP-1 | A leaderboard ranks registered players with at least 3 counted matches, by wins, then win rate, then username | Compare with seeded data |
| CP-2 | The player's own row is highlighted, and their rank is shown even if they are outside the top list | Log in as a player outside the top 20 |
| CP-3 | A stats page shows games played, wins, win rate, highest turn score, highest game score and rank | Open the stats |
| CP-4 | Match history lists the player's counted matches, newest first, with opponents, scores, result and date, loaded in pages with a Load more button | Scroll with more than 10 matches |
| CP-5 | After a counted match, the leaderboard, stats and history show the new result without the player doing anything special | Finish a game, open each page |
| CP-6 | The production database contains demo data so the leaderboard is not empty in the demo | Open the leaderboard on the live site |

### 5.4 Backend and data

| ID | Requirement | How we check it |
| --- | --- | --- |
| BK-1 | All data lives in a PostgreSQL database, created and changed only through migrations | Read the migrations folder |
| BK-2 | The frontend calls our API. There are at least 11 HTTP endpoints and a socket interface (the brief asks for at least 3) | Network tab |
| BK-3 | Every input is validated on the server and invalid input returns the standard error shape | Send bad input with a tool such as the browser console |
| BK-4 | Dice and scores are decided only on the server | Try to cheat |
| BK-5 | Rate limits protect login, register, room joining and game actions | Send many requests quickly and see 429 |
| BK-6 | The leaderboard is cached and the cache is cleared when a match finishes | Server log shows HIT and MISS |
| BK-7 | The queries for leaderboard and history use indexes, and `docs/performance.md` shows measured before and after results on large data | Read the document |
| BK-8 | Finishing a match is one database transaction that cannot pay out twice | Automated test |
| BK-9 | The server and database are deployed and reachable from the live site | Open the live site |
| BK-10 | Secrets exist only in environment variables, never in the repository | Search the repository |
| BK-11 | Internal error details are logged on the server and never sent to the browser | Trigger an error |

### 5.5 User-friendliness

| ID | Requirement | How we check it |
| --- | --- | --- |
| UX-1 | A new player reaches a playable screen in at most two taps from the home page, with no account and no help | Ask someone who has never seen it to try |
| UX-2 | Every new page works from 375 pixels wide up to a desktop screen, with no sideways scrolling | Browser device mode, plus a real phone |
| UX-3 | Every data page has a loading state, an empty state and a readable error state | Throttle the network, use a new account, stop the server |
| UX-4 | If the server takes more than 4 seconds to answer, the player sees a "waking up the server" message | Test after the server has been idle |
| UX-5 | Error messages are sentences a player can act on, never codes or blank screens | Review every error path |
| UX-6 | Forms have labels, buttons are real buttons, focus is visible, and everything can be used with the keyboard. In online games, R rolls and B passes | Use the site with the keyboard only |
| UX-7 | The existing sound switch is respected in online play | Mute, then play |
| UX-8 | Every screen has a way back or to home | Click through all pages |
| UX-9 | The existing local pass-and-play game still works exactly as before | Play a local game |

### 5.6 Deployment and repository

| ID | Requirement |
| --- | --- |
| DP-1 | A live URL opens the game. Localhost is not accepted |
| DP-2 | The repository is public and contains a README with all four names and matric numbers, our three improvements, and how to run the project |
| DP-3 | The commit history shows many small commits from all four people over the 18 days, and no single giant final commit |
| DP-4 | `main` changes only through reviewed pull requests, merged with merge commits |
| DP-5 | The repository contains `docs/game-rules.md`, `docs/frontend-state.md`, `docs/deployment.md` and `docs/performance.md` |

### 5.7 Fun

| ID | Requirement |
| --- | --- |
| FN-1 | Rolling has an animation and sound, and the result lands on the number the server chose |
| FN-2 | The winner gets the existing confetti and celebration sound |
| FN-3 | Level ups and achievements appear as lively pop-up messages |
| FN-4 | Each player appears with a pig avatar, so the board feels like the original game |

## 6. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | A game action reaches all players within about 1 second when the server is awake. A cached leaderboard answers in well under 200 milliseconds |
| Security | Server authority for all game results. Hashed passwords. Signed tokens that expire. CORS limited to our site. Secure headers. Rate limits. No secrets in Git |
| Reliability | The site must clearly tell players when the server is waking up or the connection dropped, and recover without a full reload where possible |
| Accessibility | Labelled forms, keyboard use, visible focus, announced messages for screen readers, sufficient contrast |
| Compatibility | Latest Chrome and Edge on desktop, Chrome on Android, Safari on iPhone |
| Privacy | We store only a username and a password hash. We do not collect email, phone number or location |
| Maintainability | Each person owns specific folders, each commit is small and named in the agreed format, and the code can be explained by every member |

## 7. Constraints, assumptions and risks

**Constraints:** 18 days, four people with different experience, free hosting tiers, JavaScript only, and the deadline of 16 November.

**Assumptions:** the lecturer confirms that our combination of categories is still available, and the demo room has working internet.

| Risk | What we do about it |
| --- | --- |
| Another group already took our three categories | Ask the lecturer before writing code. If taken, replace one category immediately |
| Free server and database go to sleep | Wake them 10 minutes before the demo, and keep the "waking up" message |
| The plan is too big for 18 days | Use the cut order in Section 14 of the handbook. Never cut server-side dice, deployment, rooms, XP and the leaderboard |
| Frontend and backend people block each other | Work to the contract, use fake data until the real endpoint exists, deploy early |
| Beginners merge broken code into `main` | Pull requests with a reviewer, checklist in the template, and a rule that `main` must always run |
| Code written by AI that nobody can explain | The review rule: the author must explain a piece of their pull request to the reviewer |
| Poor internet at the demo | Phone hotspot ready, servers already awake |

## 8. Traceability to the marking guide

| Mark | Item | Requirements that cover it |
| --- | --- | --- |
| 1 | Improvement 1: multiplayer | MP-1 to MP-11 |
| 1 | Improvement 2: progression | PR-1 to PR-9 |
| 1 | Improvement 3: competition | CP-1 to CP-6 |
| 1 | Backend and data | BK-1 to BK-11 |
| 1 | User-friendliness | UX-1 to UX-9 |
| 1 | Deployment and repository | DP-1 to DP-5 |
| 3 | Demo and understanding | The acceptance script below, and the "you must be able to explain" lists in the handbook |
| 1 | Fun | FN-1 to FN-4 |

## 9. Acceptance script (the project is done when all of this works on the live site)

1. Open the live URL on a phone with no account. Tap Play as guest. You can start playing within two taps.
2. Register a new account, log out, log in again.
3. On the laptop, log in as a demo player and create a room. Copy the code.
4. On the phone, join with the code. Both screens show the same lobby. Only the laptop can start.
5. Start the game. Play several turns. Rolls only work for the current player, and both screens always agree.
6. Refresh the phone in the middle of the game. It returns to the same game state.
7. Try to cheat from the browser console (send a fake roll or score, roll out of turn). The server refuses with a clear error.
8. Finish the game. Both players see the ranking, XP gained and any level up or achievement.
9. Open the profile: level, XP bar and achievements are updated.
10. Open the leaderboard and history: the new match appears, the player's own row is highlighted.
11. Stop the server for a moment, or wait until it sleeps, and reopen the site. The "waking up" message appears and the site recovers.
12. Open the repository: README is complete, history shows small commits from all four people, `docs/performance.md` shows before and after numbers.
