// import { createClient } from "redis";
import { Redis } from "ioredis";

// export const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

export const redisClient = new Redis(process.env.REDIS_URL as string);

export async function rateLimit(
  keyBase: string,
  max: number,
  windowMs: number,
) {
  const bucket = Math.floor(Date.now() / windowMs);
  const key = `rl:${keyBase}:${bucket}`;
  const count = await redisClient.incr(key);
  if (count === 1) await redisClient.pexpire(key, windowMs);
  const ok = count <= max;
  const reset = (bucket + 1) * windowMs;
  return { ok, remaining: Math.max(0, max - count), reset };
}
