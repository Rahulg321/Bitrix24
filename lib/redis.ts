let cachedClient: any;

export async function getRedisClient() {
  if (cachedClient) return cachedClient;
  const { createClient } = await import("redis");
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({ url });
  cachedClient = client;
  return client;
}
