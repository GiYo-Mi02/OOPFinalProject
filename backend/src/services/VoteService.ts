import { supabase } from "../config/supabaseClient";
import { RedisCache } from "./RedisCache";

export class VoteService {
  private readonly leaderboardCache = new RedisCache("leaderboard");
  private readonly candidatesCache = new RedisCache("candidates");
  private readonly electionsCache = new RedisCache("elections");

  async getLeaderboard(instituteId: string) {
    const cacheKey = instituteId;
    const cached = await this.leaderboardCache.get(cacheKey);
    if (cached) return cached;

    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    // Get votes with candidate details
    const { data, error } = await supabase
      .from("votes")
      .select(`
        candidate_id,
        elections!inner(institute_id),
        candidates(id, name, image_url, position_id)
      `)
      .eq("elections.institute_id", instituteId);

    if (error) throw error;

    // Tally votes and collect candidate info
    const candidateMap = new Map<string, { name: string; image_url: string | null; votes: number }>();
    
    data.forEach((vote) => {
      const candidateId = vote.candidate_id ?? "abstain";
      const candidate = (vote as any).candidates;
      
      if (!candidateMap.has(candidateId)) {
        candidateMap.set(candidateId, {
          name: candidateId === "abstain" ? "Abstain" : (candidate?.name || `Candidate ${candidateId}`),
          image_url: candidate?.image_url || null,
          votes: 0
        });
      }
      
      const entry = candidateMap.get(candidateId)!;
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

  async castVote(
    userId: string,
    voteData: {
      electionId: string;
      votes: Array<{ positionId: string; candidateId: string }>;
    }
  ) {
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    // Check if user already voted in this election
    const { data: existingVotes, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("user_id", userId)
      .eq("election_id", voteData.electionId)
      .limit(1);

    if (checkError) throw checkError;

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
    const { data, error } = await supabase
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
    const { data: electionData } = await supabase
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

  async checkIfUserVoted(userId: string, electionId: string): Promise<boolean> {
    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("user_id", userId)
      .eq("election_id", electionId)
      .limit(1);

    if (error) throw error;

    return data !== null && data.length > 0;
  }

  async getActiveElections(instituteId?: string | null) {
    const cacheKey = instituteId || "all";
    const cached = await this.electionsCache.get(cacheKey);
    if (cached) return cached;

    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    let query = supabase
      .from("elections")
      .select("*")
      .eq("status", "active");

    if (instituteId) {
      query = query.eq("institute_id", instituteId);
    }

    const { data, error } = await query.order("start_date", { ascending: false });

    if (error) throw error;

    await this.electionsCache.set(cacheKey, data, 60); // Cache for 1 minute
    return data;
  }

  async getElectionCandidates(electionId: string) {
    const cacheKey = electionId;
    const cached = await this.candidatesCache.get(cacheKey);
    if (cached) return cached;

    if (!supabase) {
      throw new Error("Supabase client is not configured.");
    }

    const { data, error } = await supabase
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

    if (error) throw error;

    // Group candidates by position
    const grouped: Record<string, any> = {};
    data?.forEach((candidate) => {
      const position = (candidate as any).positions;
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
