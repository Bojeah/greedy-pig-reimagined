import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "./authSchemas.js";

test("register accepts a valid username and lowercases it", () => {
  const result = registerSchema.parse({
    username: "  Ada_99 ",
    password: "longenough",
  });
  assert.equal(result.username, "ada_99");
});

test("register rejects a short username", () => {
  const result = registerSchema.safeParse({
    username: "ab",
    password: "longenough",
  });
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /3 to 20 characters/);
});

test("register rejects bad characters and reserved guest names", () => {
  assert.equal(
    registerSchema.safeParse({ username: "no spaces", password: "longenough" })
      .success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({ username: "guest_1234", password: "longenough" })
      .success,
    false,
  );
});

test("register rejects short and very long passwords", () => {
  assert.equal(
    registerSchema.safeParse({ username: "ada", password: "short" }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({ username: "ada", password: "x".repeat(73) })
      .success,
    false,
  );
});

test("login needs both fields", () => {
  assert.equal(loginSchema.safeParse({ username: "ada" }).success, false);
  assert.equal(
    loginSchema.safeParse({ username: "Ada", password: "x" }).success,
    true,
  );
});
