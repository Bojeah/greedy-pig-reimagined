import { randomInt } from 'node:crypto';

// No 0, O, 1 or I, because they look alike when a friend reads the code aloud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

export function normaliseCode(value) {
  return String(value ?? '').trim().toUpperCase();
}
