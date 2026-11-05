const TTL_MS = 30 * 1000;
const cache = new Map();

// Returns the cached value if it is fresh, otherwise runs loader() and stores the result.
export async function getCached(key, loader) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    console.log(`[cache] HIT ${key}`);
    return hit.value;
  }
  console.log(`[cache] MISS ${key}`);
  const value = await loader();
  cache.set(key, { value, expires: Date.now() + TTL_MS });
  return value;
}

// Called when a match finishes, so the next leaderboard request is fresh.
export function invalidateLeaderboard() {
  cache.clear();
}
