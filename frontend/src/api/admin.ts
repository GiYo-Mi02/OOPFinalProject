import { http } from "../lib/http";

// Elections
export interface Election {
  id: string;
  title: string;
  description?: string;
  institute_id: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

export interface CreateElectionRequest {
  title: string;
  description?: string;
  institute_id: string;
  start_date: string;
  end_date: string;
  status?: "upcoming" | "active" | "completed";
}

export async function getElections() {
  return http<{ elections: Election[] }>("/admin/elections");
}

export async function createElection(data: CreateElectionRequest) {
  return http<{ message: string; election: Election }>("/admin/elections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateElection(id: string, data: CreateElectionRequest) {
  return http<{ message: string; election: Election }>(`/admin/elections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteElection(id: string) {
  return http<{ message: string }>(`/admin/elections/${id}`, {
    method: "DELETE",
  });
}

// Institutes
export interface Institute {
  code: string;
  name: string;
  type: "college" | "institute";
  created_at: string;
  updated_at: string;
}

export async function getInstitutes() {
  return http<{ institutes: Institute[] }>("/institutes");
}

// Candidates
export interface Candidate {
  id: string;
  name: string;
  position_id: string;
  platform?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  positions?: {
    id: string;
    title: string;
    election_id: string;
    elections?: {
      id: string;
      title: string;
      institute_id: string;
    };
  };
}

export interface Position {
  id: string;
  election_id: string;
  title: string;
  display_order: number;
  created_at: string;
}

export interface CreateCandidateRequest {
  name: string;
  position_id: string;
  college?: string;
  description?: string;
  past_leadership?: string;
  grades?: string;
  qualifications?: string;
  image_url?: string;
}

export async function getCandidates() {
  return http<{ candidates: Candidate[] }>("/admin/candidates");
}

export async function getPositionsByElection(electionId: string) {
  return http<{ positions: Position[] }>(`/admin/elections/${electionId}/positions`);
}

export async function createPosition(data: { election_id: string; title: string; display_order?: number }) {
  return http<{ message: string; position: Position }>("/admin/positions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCandidate(data: CreateCandidateRequest) {
  return http<{ message: string; candidate: Candidate }>("/admin/candidates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCandidate(id: string, data: CreateCandidateRequest) {
  return http<{ message: string; candidate: Candidate }>(`/admin/candidates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCandidate(id: string) {
  return http<{ message: string }>(`/admin/candidates/${id}`, {
    method: "DELETE",
  });
}

// Analytics
export interface Analytics {
  stats: {
    totalVoters: number;
    votesCast: number;
    turnoutRate: number;
    activeElections: number;
    completedElections: number;
  };
  instituteBreakdown: Record<string, number>;
  hourlyVotes: Record<string, number>;
}

export async function getAnalytics() {
  return http<Analytics>("/admin/analytics");
}
