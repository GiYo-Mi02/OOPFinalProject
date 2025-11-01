import Redis from "ioredis";
import { env, isProd } from "./env";

let redis: Redis | undefined;

if (env.REDIS_URL) {
  redis = new Redis(env.REDIS_URL, {
    enableAutoPipelining: true,
    maxRetriesPerRequest: isProd ? 5 : 0,
  });
} else {
  console.warn("REDIS_URL is not set. Redis-backed features will be disabled until configured.");
}

export { redis };
