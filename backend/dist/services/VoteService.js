"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteService = void 0;
const supabaseClient_1 = require("../config/supabaseClient");
const RedisCache_1 = require("./RedisCache");
class VoteService {
    constructor() {
        this.cache = new RedisCache_1.RedisCache("leaderboard");
    }
    async getLeaderboard(instituteId) {
        const cacheKey = instituteId;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        const { data, error } = await supabaseClient_1.supabase
            .from("votes")
            .select("candidate_id")
            .eq("institute_id", instituteId);
        if (error)
            throw error;
        const tallies = data.reduce((acc, vote) => {
            const key = vote.candidate_id ?? "abstain";
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
        await this.cache.set(cacheKey, tallies, 10);
        return tallies;
    }
}
exports.VoteService = VoteService;
