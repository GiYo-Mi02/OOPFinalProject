"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redisClient_1 = require("../config/redisClient");
class RedisCache {
    constructor(namespace = "cache") {
        this.namespace = namespace;
    }
    buildKey(key) {
        return `${this.namespace}:${key}`;
    }
    async get(key) {
        if (!redisClient_1.redis)
            return null;
        const raw = await redisClient_1.redis.get(this.buildKey(key));
        return raw ? JSON.parse(raw) : null;
    }
    async set(key, value, ttlSeconds = 60) {
        if (!redisClient_1.redis)
            return;
        const payload = JSON.stringify(value);
        if (ttlSeconds > 0) {
            await redisClient_1.redis.setex(this.buildKey(key), ttlSeconds, payload);
        }
        else {
            await redisClient_1.redis.set(this.buildKey(key), payload);
        }
    }
    async delete(key) {
        if (!redisClient_1.redis)
            return;
        await redisClient_1.redis.del(this.buildKey(key));
    }
}
exports.RedisCache = RedisCache;
