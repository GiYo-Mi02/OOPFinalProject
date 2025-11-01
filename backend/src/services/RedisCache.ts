import { redis } from "../config/redisClient";

export class RedisCache<T = unknown> {
  constructor(private readonly namespace = "cache") {}

  private buildKey(key: string) {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | null> {
    if (!redis) return null;
    const raw = await redis.get(this.buildKey(key));
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: T, ttlSeconds = 60) {
    if (!redis) return;
    const payload = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.setex(this.buildKey(key), ttlSeconds, payload);
    } else {
      await redis.set(this.buildKey(key), payload);
    }
  }

  async delete(key: string) {
    if (!redis) return;
    await redis.del(this.buildKey(key));
  }
}
