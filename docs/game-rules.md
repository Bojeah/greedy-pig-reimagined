# Game rules

These are the rules of the base game, read from apps/web/src/routes/play_friends_live/game/components/DiceSection.jsx and the How To Play page. The server engine (apps/server/src/modules/game/engine.js) reproduces them exactly.

1. The game uses one six-sided die.
2. On their turn a player rolls as many times as they like.
3. Rolling 2 to 6 adds that number to the player's running points for the turn.
4. Rolling a 1 wipes the running points of that turn and passes the turn to the next player. Points already banked are kept.
5. Pass (bank) adds the running points to the player's total points and passes the turn. It is allowed at any time, even with 0 running points.
6. A player's score is their total points plus their running points.
7. The game ends the instant a player's total plus running points reaches the target score. The player does not have to pass first.

## Added by the online version (enforced by the server)

- Only the current player can roll or pass.
- The die is rolled on the server with crypto.randomInt. The browser never sends a dice value or a score.
- Settings: target score 25 to 200 (default 100), 2 to 4 players (default 2), 15 to 60 seconds per turn (default 30).
- If the turn timer runs out, the server passes for the player.
- A disconnected player keeps their seat for 60 seconds. If they come back they rejoin the same game. If not, they forfeit.
- If fewer than 2 players are left, the match is abandoned and nobody gets XP.
- Placements: the winner is 1st, everyone else is ranked by score.
