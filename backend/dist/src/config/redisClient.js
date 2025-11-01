"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
let redis;
if (env_1.env.REDIS_URL) {
    exports.redis = redis = new ioredis_1.default(env_1.env.REDIS_URL, {
        enableAutoPipelining: true,
        maxRetriesPerRequest: env_1.isProd ? 5 : 0,
    });
}
else {
    console.warn("REDIS_URL is not set. Redis-backed features will be disabled until configured.");
}
