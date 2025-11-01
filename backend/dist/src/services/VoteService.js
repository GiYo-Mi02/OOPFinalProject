"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteService = void 0;
const supabaseClient_1 = require("../config/supabaseClient");
const RedisCache_1 = require("./RedisCache");
class VoteService {
    constructor() {
        this.leaderboardCache = new RedisCache_1.RedisCache("leaderboard");
        this.candidatesCache = new RedisCache_1.RedisCache("candidates");
        this.electionsCache = new RedisCache_1.RedisCache("elections");
    }
    async getLeaderboard(instituteId) {
        const cacheKey = instituteId;
        const cached = await this.leaderboardCache.get(cacheKey);
        if (cached)
            return cached;
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        // Get votes with candidate details
        const { data, error } = await supabaseClient_1.supabase
            .from("votes")
            .select(`
        candidate_id,
        elections!inner(institute_id),
        candidates(id, name, image_url, position_id)
      `)
            .eq("elections.institute_id", instituteId);
        if (error)
            throw error;
        // Tally votes and collect candidate info
        const candidateMap = new Map();
        data.forEach((vote) => {
            const candidateId = vote.candidate_id ?? "abstain";
            const candidate = vote.candidates;
            if (!candidateMap.has(candidateId)) {
                candidateMap.set(candidateId, {
                    name: candidateId === "abstain" ? "Abstain" : (candidate?.name || `Candidate ${candidateId}`),
                    image_url: candidate?.image_url || null,
                    votes: 0
                });
            }
            const entry = candidateMap.get(candidateId);
            entry.votes += 1;
        });
        // Convert to array and sort by votes
        const leaderboard = Array.from(candidateMap.entries()).map(([id, data]) => ({
            candidateId: id,
            name: data.name,
            imageUrl: data.image_url,
            votes: data.votes
        })).sort((a, b) => b.votes - a.votes);
        await this.leaderboardCache.set(cacheKey, leaderboard, 10);
        return leaderboard;
    }
    async castVote(userId, voteData) {
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        // Check if user already voted in this election
        const { data: existingVotes, error: checkError } = await supabaseClient_1.supabase
            .from("votes")
            .select("id")
            .eq("user_id", userId)
            .eq("election_id", voteData.electionId)
            .limit(1);
        if (checkError)
            throw checkError;
        if (existingVotes && existingVotes.length > 0) {
            throw new Error("You have already voted in this election");
        }
        // Prepare vote records
        const voteRecords = voteData.votes.map((vote) => ({
            user_id: userId,
            election_id: voteData.electionId,
            position_id: vote.positionId,
            candidate_id: vote.candidateId === "abstain" ? null : vote.candidateId,
            created_at: new Date().toISOString(),
        }));
        // Insert all votes
        const { data, error } = await supabaseClient_1.supabase
            .from("votes")
            .insert(voteRecords)
            .select();
        if (error) {
            // Check for unique constraint violation
            if (error.code === "23505") {
                throw new Error("You have already voted for one or more positions");
            }
            throw error;
        }
        // Invalidate cache for the institute
        const { data: electionData } = await supabaseClient_1.supabase
            .from("elections")
            .select("institute_id")
            .eq("id", voteData.electionId)
            .single();
        if (electionData?.institute_id) {
            await this.leaderboardCache.delete(electionData.institute_id);
            await this.candidatesCache.delete(voteData.electionId);
        }
        return { votesCount: data?.length ?? 0 };
    }
    async checkIfUserVoted(userId, electionId) {
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        const { data, error } = await supabaseClient_1.supabase
            .from("votes")
            .select("id")
            .eq("user_id", userId)
            .eq("election_id", electionId)
            .limit(1);
        if (error)
            throw error;
        return data !== null && data.length > 0;
    }
    async getActiveElections(instituteId) {
        const cacheKey = instituteId || "all";
        const cached = await this.electionsCache.get(cacheKey);
        if (cached)
            return cached;
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        let query = supabaseClient_1.supabase
            .from("elections")
            .select("*")
            .eq("status", "active");
        if (instituteId) {
            query = query.eq("institute_id", instituteId);
        }
        const { data, error } = await query.order("start_date", { ascending: false });
        if (error)
            throw error;
        await this.electionsCache.set(cacheKey, data, 60); // Cache for 1 minute
        return data;
    }
    async getElectionCandidates(electionId) {
        const cacheKey = electionId;
        const cached = await this.candidatesCache.get(cacheKey);
        if (cached)
            return cached;
        if (!supabaseClient_1.supabase) {
            throw new Error("Supabase client is not configured.");
        }
        const { data, error } = await supabaseClient_1.supabase
            .from("candidates")
            .select(`
        *,
        positions!inner(
          id,
          title,
          description,
          display_order,
          election_id
        )
      `)
            .eq("positions.election_id", electionId)
            .order("display_order", { ascending: true, foreignTable: "positions" });
        if (error)
            throw error;
        // Group candidates by position
        const grouped = {};
        data?.forEach((candidate) => {
            const position = candidate.positions;
            if (!grouped[position.id]) {
                grouped[position.id] = {
                    id: position.id,
                    title: position.title,
                    description: position.description,
                    display_order: position.display_order,
                    candidates: [],
                };
            }
            grouped[position.id].candidates.push({
                id: candidate.id,
                name: candidate.name,
                platform: candidate.platform,
                image_url: candidate.image_url,
            });
        });
        const result = Object.values(grouped);
        await this.candidatesCache.set(cacheKey, result, 120); // Cache for 2 minutes
        return result;
    }
}
exports.VoteService = VoteService;
