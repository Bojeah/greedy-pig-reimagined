import test from "node:test";
import assert from "node:assert/strict";
import { initialOnlineState, onlineReducer } from "./onlineGameReducer.js";

const room = (version) => ({
  code: "ABCDE",
  status: "PLAYING",
  game: { version },
});

test("a newer room_state replaces the old one", () => {
  const s1 = onlineReducer(initialOnlineState, {
    type: "room_state",
    room: room(3),
  });
  const s2 = onlineReducer(s1, { type: "room_state", room: room(4) });
  assert.equal(s2.room.game.version, 4);
});

test("a late, older room_state is ignored", () => {
  const s1 = onlineReducer(initialOnlineState, {
    type: "room_state",
    room: room(5),
  });
  const s2 = onlineReducer(s1, { type: "room_state", room: room(4) });
  assert.equal(s2.room.game.version, 5);
});

test("lobby states without a game are accepted", () => {
  const s = onlineReducer(initialOnlineState, {
    type: "room_state",
    room: { code: "ABCDE", status: "LOBBY", game: null },
  });
  assert.equal(s.room.status, "LOBBY");
});

test("rolling turns on, and a game event turns it off", () => {
  const s1 = onlineReducer(initialOnlineState, { type: "rolling" });
  assert.equal(s1.rolling, true);
  const s2 = onlineReducer(s1, {
    type: "game_event",
    event: { type: "ROLL", playerId: "a", value: 4 },
  });
  assert.equal(s2.rolling, false);
  assert.equal(s2.lastEvent.value, 4);
});

test("an error stops rolling and is stored", () => {
  const s = onlineReducer(
    { ...initialOnlineState, rolling: true },
    { type: "error", error: { code: "NOT_YOUR_TURN", message: "x" } },
  );
  assert.equal(s.rolling, false);
  assert.equal(s.error.code, "NOT_YOUR_TURN");
});

test("only the last 3 reactions are kept", () => {
  let s = initialOnlineState;
  for (let i = 0; i < 5; i++)
    s = onlineReducer(s, { type: "reaction", reaction: { id: i } });
  assert.deepEqual(
    s.reactions.map((r) => r.id),
    [2, 3, 4],
  );
});

test("reset clears the game but keeps the connection status", () => {
  const s = onlineReducer(
    { ...initialOnlineState, connection: "connected", room: room(2) },
    { type: "reset" },
  );
  assert.equal(s.room, null);
  assert.equal(s.connection, "connected");
});
