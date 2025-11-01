"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const supabaseClient_1 = require("../config/supabaseClient");
const RedisCache_1 = require("./RedisCache");
class AdminService {
    constructor() {
        this.cache = new RedisCache_1.RedisCache("leaderboard");
    }
    // Elections
    async getElections() {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("elections")
            .select("*")
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async createElection(payload) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("elections")
            .insert({
            title: payload.title,
            description: payload.description,
            institute_id: payload.institute_id,
            start_date: payload.start_date.toISOString(),
            end_date: payload.end_date.toISOString(),
            status: payload.status || "upcoming",
        })
            .select()
            .single();
        if (error)
            throw error;
        // Invalidate cache
        await this.cache.delete(payload.institute_id);
        return data;
    }
    async updateElection(id, payload) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("elections")
            .update({
            title: payload.title,
            description: payload.description,
            institute_id: payload.institute_id,
            start_date: payload.start_date.toISOString(),
            end_date: payload.end_date.toISOString(),
            status: payload.status,
        })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        // Invalidate cache
        await this.cache.delete(payload.institute_id);
        return data;
    }
    async deleteElection(id) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        // Get election first to clear cache
        const { data: election } = await supabaseClient_1.supabase
            .from("elections")
            .select("institute_id")
            .eq("id", id)
            .single();
        const { error } = await supabaseClient_1.supabase.from("elections").delete().eq("id", id);
        if (error)
            throw error;
        // Invalidate cache
        if (election) {
            await this.cache.delete(election.institute_id);
        }
    }
    // Candidates
    async getCandidates() {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("candidates")
            .select(`
        *,
        positions(
          id,
          title,
          election_id,
          elections(id, title, institute_id)
        )
      `)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        return data;
    }
    // Get positions for an election
    async getPositionsByElection(electionId) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("positions")
            .select("*")
            .eq("election_id", electionId)
            .order("display_order", { ascending: true });
        if (error)
            throw error;
        return data || [];
    }
    // Create a new position
    async createPosition(payload) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        // Calculate display_order if not provided
        let displayOrder = payload.display_order;
        if (displayOrder === undefined) {
            const { data: maxOrder } = await supabaseClient_1.supabase
                .from("positions")
                .select("display_order")
                .eq("election_id", payload.election_id)
                .order("display_order", { ascending: false })
                .limit(1)
                .single();
            displayOrder = maxOrder ? maxOrder.display_order + 1 : 1;
        }
        const { data, error } = await supabaseClient_1.supabase
            .from("positions")
            .insert({
            election_id: payload.election_id,
            title: payload.title,
            display_order: displayOrder,
        })
            .select()
            .single();
        if (error)
            throw error;
        // Invalidate cache
        const { data: election } = await supabaseClient_1.supabase
            .from("elections")
            .select("institute_id")
            .eq("id", payload.election_id)
            .single();
        if (election) {
            await this.cache.delete(election.institute_id);
        }
        return data;
    }
    // Find or create position by title and election
    async findOrCreatePosition(electionId, positionTitle) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        // First try to find existing position
        const { data: existing } = await supabaseClient_1.supabase
            .from("positions")
            .select("id")
            .eq("election_id", electionId)
            .eq("title", positionTitle)
            .single();
        if (existing) {
            return existing.id;
        }
        // Create new position if not found
        // Calculate display_order
        const { data: maxOrder } = await supabaseClient_1.supabase
            .from("positions")
            .select("display_order")
            .eq("election_id", electionId)
            .order("display_order", { ascending: false })
            .limit(1)
            .single();
        const displayOrder = maxOrder ? maxOrder.display_order + 1 : 1;
        const { data: newPosition, error } = await supabaseClient_1.supabase
            .from("positions")
            .insert({
            election_id: electionId,
            title: positionTitle,
            display_order: displayOrder,
        })
            .select("id")
            .single();
        if (error)
            throw error;
        return newPosition.id;
    }
    async createCandidate(payload) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("candidates")
            .insert({
            name: payload.name,
            position_id: payload.position_id,
            platform: payload.platform || `${payload.description || ''}\nPast Leadership: ${payload.past_leadership || ''}\nGrades: ${payload.grades || ''}\nQualifications: ${payload.qualifications || ''}`.trim(),
            image_url: payload.image_url,
        })
            .select()
            .single();
        if (error)
            throw error;
        // Get position to invalidate cache
        const { data: position } = await supabaseClient_1.supabase
            .from("positions")
            .select("election_id, elections(institute_id)")
            .eq("id", payload.position_id)
            .single();
        if (position && position.elections) {
            await this.cache.delete(position.elections.institute_id);
        }
        return data;
    }
    async updateCandidate(id, payload) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        const { data, error } = await supabaseClient_1.supabase
            .from("candidates")
            .update({
            name: payload.name,
            position_id: payload.position_id,
            platform: payload.platform || `${payload.description || ''}\nPast Leadership: ${payload.past_leadership || ''}\nGrades: ${payload.grades || ''}\nQualifications: ${payload.qualifications || ''}`.trim(),
            image_url: payload.image_url,
        })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        // Get position to invalidate cache
        const { data: position } = await supabaseClient_1.supabase
            .from("positions")
            .select("election_id, elections(institute_id)")
            .eq("id", payload.position_id)
            .single();
        if (position && position.elections) {
            await this.cache.delete(position.elections.institute_id);
        }
        return data;
    }
    async deleteCandidate(id) {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        // Get candidate first to clear cache
        const { data: candidate } = await supabaseClient_1.supabase
            .from("candidates")
            .select("position_id, positions(election_id, elections(institute_id))")
            .eq("id", id)
            .single();
        const { error } = await supabaseClient_1.supabase.from("candidates").delete().eq("id", id);
        if (error)
            throw error;
        // Invalidate cache
        if (candidate && candidate.positions) {
            const positions = candidate.positions;
            if (positions.elections) {
                await this.cache.delete(positions.elections.institute_id);
            }
        }
    }
    // Analytics
    async getAnalytics() {
        if (!supabaseClient_1.supabase)
            throw new Error("Supabase client is not configured.");
        // Get total voters
        const { count: totalVoters } = await supabaseClient_1.supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("role", "student");
        // Get total votes cast
        const { count: votesCast } = await supabaseClient_1.supabase
            .from("votes")
            .select("*", { count: "exact", head: true });
        // Calculate turnout rate
        const turnoutRate = totalVoters && totalVoters > 0 ? ((votesCast || 0) / totalVoters) * 100 : 0;
        // Get active elections
        const { count: activeElections } = await supabaseClient_1.supabase
            .from("elections")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");
        // Get completed elections
        const { count: completedElections } = await supabaseClient_1.supabase
            .from("elections")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed");
        // Get institute breakdown
        const { data: institutes } = await supabaseClient_1.supabase
            .from("votes")
            .select("elections(institute_id)")
            .not("elections", "is", null);
        const instituteBreakdown = {};
        institutes?.forEach((vote) => {
            const institute = vote.elections?.institute_id;
            if (institute) {
                instituteBreakdown[institute] = (instituteBreakdown[institute] || 0) + 1;
            }
        });
        // Get hourly votes (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const { data: recentVotes } = await supabaseClient_1.supabase
            .from("votes")
            .select("created_at")
            .gte("created_at", twentyFourHoursAgo.toISOString());
        const hourlyVotes = {};
        recentVotes?.forEach((vote) => {
            const hour = new Date(vote.created_at).getHours();
            const hourKey = `${hour}:00`;
            hourlyVotes[hourKey] = (hourlyVotes[hourKey] || 0) + 1;
        });
        return {
            stats: {
                totalVoters: totalVoters || 0,
                votesCast: votesCast || 0,
                turnoutRate: parseFloat(turnoutRate.toFixed(2)),
                activeElections: activeElections || 0,
                completedElections: completedElections || 0,
            },
            instituteBreakdown,
            hourlyVotes,
        };
    }
}
exports.AdminService = AdminService;
