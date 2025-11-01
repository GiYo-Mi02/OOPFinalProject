"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const supabaseClient_1 = require("../config/supabaseClient");
const RedisCache_1 = require("./RedisCache");
class AdminService {
    constructor() {
        this.cache = new RedisCache_1.RedisCache("admin:leaderboard");
    }
    async publishElection(payload) {
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        const { data, error } = await supabaseClient_1.supabase.from("elections").insert({
            name: payload.name,
            institute_id: payload.instituteId,
            starts_at: payload.startsAt.toISOString(),
            ends_at: payload.endsAt.toISOString(),
        });
        if (error)
            throw error;
        await this.cache.delete(payload.instituteId);
        return data;
    }
}
exports.AdminService = AdminService;
