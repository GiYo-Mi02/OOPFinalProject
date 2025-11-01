import { http } from "../lib/http";

interface LeaderboardEntry {
  candidateId: string;
  name: string;
  imageUrl: string | null;
  votes: number;
}

interface LeaderboardResponse {
  instituteId: string;
  leaderboard: LeaderboardEntry[];
}

interface CastVoteRequest {
  electionId: string;
  votes: Array<{
    positionId: string;
    candidateId: string;
  }>;
}

interface CastVoteResponse {
  success: boolean;
  votesCount: number;
}

interface VoteStatusResponse {
  hasVoted: boolean;
}

export async function fetchLeaderboard(instituteId: string) {
  return http<LeaderboardResponse>(`/votes/leaderboard/${encodeURIComponent(instituteId)}`);
}

export async function castVote(voteData: CastVoteRequest) {
  return http<CastVoteResponse>("/votes/cast", {
    method: "POST",
    body: JSON.stringify(voteData),
  });
}

export async function checkVoteStatus(electionId: string) {
  return http<VoteStatusResponse>(`/votes/check/${encodeURIComponent(electionId)}`);
}

export interface ActiveElection {
  id: string;
  title: string;
  description?: string;
  institute_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface ElectionCandidate {
  id: string;
  title: string;
  description?: string;
  display_order: number;
  candidates: Array<{
    id: string;
    name: string;
    platform?: string;
    image_url?: string;
  }>;
}

export async function getActiveElections() {
  return http<{ elections: ActiveElection[] }>("/votes/elections/active");
}

export async function getElectionCandidates(electionId: string) {
  return http<{ candidates: ElectionCandidate[] }>(`/votes/elections/${encodeURIComponent(electionId)}/candidates`);
}
