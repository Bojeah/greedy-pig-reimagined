import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../../app.js';

async function withServer(fn) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await fn(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test('POST /api/auth/guest issues a JWT for a guest user', async () => {
  await withServer(async (port) => {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    assert.equal(res.status, 200, 'guest auth should return 200');
    const body = await res.json();
    assert.ok(body.token, 'guest auth should return a JWT');
    assert.equal(body.user.isGuest, true);
    assert.ok(body.user.username.startsWith('guest_'));
  });
});
