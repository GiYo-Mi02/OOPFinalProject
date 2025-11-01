import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Vote, CheckCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { castVote, checkVoteStatus, getActiveElections, getElectionCandidates } from "../api/votes";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/errors";

// Parse platform string from database format
function parsePlatform(platform?: string): { description: string; pastLeadership: string; grades: string; qualifications: string } {
  if (!platform) return { description: '', pastLeadership: '', grades: '', qualifications: '' };
  const parts = platform.split('|').map(p => p.trim());
  return {
    description: parts[0] || '',
    pastLeadership: parts[1] || '',
    grades: parts[2] || '',
    qualifications: parts[3] || '',
  };
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  description: string;
  pastLeadership: string;
  grades: string;
  qualifications: string;
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

export function VotingPage() {
  const { user } = useAuth();
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active elections for the user's institute
  const activeElectionsQuery = useQuery({
    queryKey: ["activeElections"],
    queryFn: async () => {
      const response = await getActiveElections();
      // Filter by user's institute if available
      return response.elections.filter(e => !user?.instituteId || e.institute_id === user.instituteId);
    },
    enabled: Boolean(user),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Get the first active election (or null if none)
  const activeElection = activeElectionsQuery.data?.[0];
  const electionId = activeElection?.id;

  // Fetch candidates for the active election
  const candidatesQuery = useQuery({
    queryKey: ["electionCandidates", electionId],
    queryFn: async () => {
      if (!electionId) return { candidates: [] };
      return getElectionCandidates(electionId);
    },
    enabled: Boolean(electionId),
    refetchInterval: 5000, // Auto-refresh every 5 seconds for real-time candidate updates
  });

  // Convert API response to Position format
  const positions: Position[] = candidatesQuery.data?.candidates.map(pos => ({
    id: pos.id,
    title: pos.title,
    candidates: pos.candidates.map(cand => {
      const platformData = parsePlatform(cand.platform);
      return {
        id: cand.id,
        name: cand.name,
        position: pos.title,
        imageUrl: cand.image_url,
        ...platformData,
      };
    }),
  })) || [];

  // Check if user has already voted
  const voteStatusQuery = useQuery({
    queryKey: ["voteStatus", electionId],
    queryFn: () => electionId ? checkVoteStatus(electionId) : Promise.resolve({ hasVoted: false }),
    enabled: Boolean(user && electionId),
    refetchInterval: 5000, // Check every 5 seconds for real-time updates
  });

  // Cast vote mutation
  const castVoteMutation = useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      voteStatusQuery.refetch();
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setShowConfirmation(false);
    },
  });

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handleSubmitVote = () => {
    // Check if all positions have selections
    const allPositionsVoted = positions.every(pos => selectedCandidates[pos.id]);
    
    if (!allPositionsVoted) {
      alert("Please vote for all positions or choose to abstain.");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    if (!electionId) {
      setError("Election ID not found");
      return;
    }

    const votes = Object.entries(selectedCandidates).map(([positionId, candidateId]) => ({
      positionId,
      candidateId,
    }));

    castVoteMutation.mutate({
      electionId,
      votes,
    });
  };

  // Show loading state
  if (activeElectionsQuery.isLoading || candidatesQuery.isLoading || voteStatusQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading election data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (activeElectionsQuery.error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-red-600 dark:text-red-400">
            Error loading elections
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(activeElectionsQuery.error)}
          </p>
        </div>
      </div>
    );
  }

  // Show "no active elections" state
  if (!activeElection) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500">
            <Vote className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              No Active Elections
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              There are currently no active elections for your institute. Check back later!
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show success state if already voted
  if (voteStatusQuery.data?.hasVoted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="animate-slide-up space-y-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Vote Submitted Successfully!
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              Thank you for participating in the election. Your vote has been securely recorded.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              🔒 Your vote is anonymous and cannot be changed once submitted.
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cast Your Vote
          </h1>
          {(candidatesQuery.isFetching || activeElectionsQuery.isFetching) && (
            <span className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              <RefreshCcw className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          {activeElection.title}
        </p>
        {activeElection.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
            {activeElection.description}
          </p>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-semibold">Error:</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold">Important:</p>
              <p className="mt-1">You can only vote once. Your vote cannot be changed after submission. Please review your selections carefully before submitting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positions and Candidates */}
      {positions.map((position) => (
        <div
          key={position.id}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {position.title}
          </h2>

          <div className="space-y-4">
            {position.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidates[position.id] === candidate.id}
                onSelect={() => handleSelectCandidate(position.id, candidate.id)}
              />
            ))}

            {/* Abstain Option */}
            <button
              onClick={() => handleSelectCandidate(position.id, "abstain")}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                selectedCandidates[position.id] === "abstain"
                  ? "border-gray-400 bg-gray-100 dark:border-slate-600 dark:bg-slate-800"
                  : "border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Abstain
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Choose not to vote for this position
                  </p>
                </div>
                {selectedCandidates[position.id] === "abstain" && (
                  <CheckCircle className="h-6 w-6 text-gray-600 dark:text-slate-400" />
                )}
              </div>
            </button>
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="sticky bottom-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Ready to submit your vote?
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {Object.keys(selectedCandidates).length} / {positions.length} positions voted
            </p>
          </div>
          <Button onClick={handleSubmitVote} className="gap-2" size="lg">
            <Vote className="h-5 w-5" />
            Submit Vote
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirm Your Vote
            </h3>
            <p className="mt-4 text-gray-600 dark:text-slate-400">
              Once submitted, your vote cannot be changed. Are you sure you want to proceed?
            </p>

            <div className="mt-6 space-y-2">
              {positions.map((position) => (
                <div key={position.id} className="rounded-lg bg-gray-50 p-3 dark:bg-slate-800/50">
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    {position.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {selectedCandidates[position.id] === "abstain"
                      ? "Abstain"
                      : position.candidates.find(c => c.id === selectedCandidates[position.id])?.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
                disabled={castVoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmVote} 
                className="flex-1 gap-2"
                disabled={castVoteMutation.isPending}
              >
                {castVoteMutation.isPending ? (
                  <>
                    <RefreshCcw className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}

function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`w-full rounded-xl border-2 p-6 transition-all cursor-pointer ${
        isSelected
          ? "border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/20 dark:border-primary-400 dark:bg-primary-500/10"
          : "border-gray-200 hover:border-primary-300 dark:border-slate-700 dark:hover:border-slate-600"
      }`}
    >
      <div className="flex gap-4" onClick={onSelect}>
        {/* Image */}
        <div className="flex-shrink-0">
          {candidate.imageUrl ? (
            <img
              src={candidate.imageUrl}
              alt={candidate.name}
              className="h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-200 dark:bg-slate-700">
              <span className="text-3xl font-bold text-gray-400 dark:text-slate-500">
                {candidate.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {candidate.description}
              </p>
            </div>
            {isSelected && (
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary-600 dark:text-primary-400" />
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>

          {showDetails && (
            <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-slate-500">
                  Past Leadership
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
                  {candidate.pastLeadership}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-slate-500">
                  Academic Performance
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
                  {candidate.grades}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-slate-500">
                  Qualifications
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
                  {candidate.qualifications}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
