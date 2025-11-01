import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { RefreshCcw, Users, TrendingUp, Award, Vote, AlertCircle, Building2 } from "lucide-react";
import { fetchLeaderboard } from "../api/votes";
import { getInstitutes } from "../api/admin";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FormMessage } from "../components/ui/FormMessage";
import { getErrorMessage } from "../utils/errors";

export function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch institutes from the database
  const institutesQuery = useQuery({
    queryKey: ["institutes"],
    queryFn: getInstitutes,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const institutes = institutesQuery.data?.institutes || [];

  const defaultInstitute = useMemo(() => {
    // User must use their own institute - no switching allowed
    if (user?.instituteId) {
      return user.instituteId.toLowerCase();
    }
    return institutes[0]?.code || "ccis";
  }, [user?.instituteId, institutes]);

  const [instituteId, setInstituteId] = useState(defaultInstitute);

  // Update instituteId when user changes or default changes
  useMemo(() => {
    if (user?.instituteId) {
      setInstituteId(user.instituteId.toLowerCase());
    }
  }, [user?.instituteId]);

  const query = useQuery({
    queryKey: ["leaderboard", instituteId],
    queryFn: () => fetchLeaderboard(instituteId),
    enabled: Boolean(instituteId),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true, // Keep refreshing even when tab is not active
  });

  const leaderboardEntries = useMemo(() => {
    if (!query.data?.leaderboard) return [];
    return query.data.leaderboard; // Already sorted from backend
  }, [query.data]);

  const totalVotes = leaderboardEntries.reduce((sum, entry) => sum + entry.votes, 0);
  const leader = leaderboardEntries[0];

  // Show warning if user hasn't set their institute
  if (!user?.instituteId) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Select Your College/Institute
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              You need to set your college/institute before you can view the leaderboard or cast votes.
            </p>
          </div>
          <Link to="/account">
            <Button className="gap-2" size="lg">
              <Building2 className="h-5 w-5" />
              Go to Account Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <TrendingUp className="h-3.5 w-3.5" />
            Live insights
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
            Auto-updates every 5s
          </div>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {institutes.find((item) => item.code === instituteId)?.name ?? "Institute"} Leaderboard
            </h1>
            <p className="mt-2 text-base leading-relaxed text-gray-700 dark:text-slate-400">
              Track turnout and candidate performance in real time. Data is cached via Redis for fast updates and automatically refreshes whenever you revisit this page.
            </p>
          </div>
          <Link to="/vote">
            <Button className="gap-2 whitespace-nowrap" size="lg">
              <Vote className="h-5 w-5" />
              Cast Your Vote
            </Button>
          </Link>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="font-medium text-gray-900 dark:text-slate-300">
            Your Institute:
          </span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {institutes.find((item) => item.code === instituteId)?.code.toUpperCase()} - {institutes.find((item) => item.code === instituteId)?.name}
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={() => query.refetch()}
          disabled={query.isLoading || query.isRefetching}
        >
          <RefreshCcw className={`h-4 w-4 ${query.isRefetching ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">Total Ballots</p>
              <p className="mt-2 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-4xl font-bold text-transparent">
                {totalVotes}
              </p>
            </div>
            <span className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-4 text-white shadow-lg shadow-primary-500/30 transition-all group-hover:scale-110 group-hover:shadow-xl">
              <Users className="h-7 w-7" aria-hidden />
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
            Includes abstentions. Redis caching keeps tallies responsive even during peak voting periods.
          </p>
        </Card>

        <Card className="group hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">Leading Candidate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
                {leader ? leader.name : "N/A"}
              </p>
            </div>
            <span className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-lg shadow-emerald-500/30 transition-all group-hover:scale-110 group-hover:shadow-xl">
              <Award className="h-7 w-7" aria-hidden />
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
            {leader ? `${leader.votes} votes (${totalVotes > 0 ? Math.round((leader.votes / totalVotes) * 100) : 0}%)` : "No votes yet"}
          </p>
        </Card>

        <Card className="group hover:scale-[1.02]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Audit Log Snapshot</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
            Detailed export options (PDF, CSV) are available in the administrative console. Integrate with Supabase storage for long-term archival.
          </p>
        </Card>
      </div>

      {/* Leaderboard Card */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-8 py-5 dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/40">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Candidate Leaderboard</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {query.isLoading ? (
            <div className="flex items-center justify-center px-8 py-16">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : query.isError ? (
            <div className="px-8 py-16">
              <FormMessage intent="error" className="text-center">
                {getErrorMessage(query.error)}
              </FormMessage>
            </div>
          ) : leaderboardEntries.length === 0 ? (
            <p className="px-8 py-16 text-center text-sm text-gray-600 dark:text-slate-500">
              No votes recorded yet for this institute.
            </p>
          ) : (
            leaderboardEntries.map((entry, index) => (
              <div
                key={`${entry.candidateId}-${index}`}
                className="group flex items-center justify-between px-8 py-5 transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/40"
              >
                <div className="flex items-center gap-5">
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-lg transition-all group-hover:scale-110 ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-500/30"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 shadow-gray-400/30"
                        : index === 2
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/30"
                        : "border border-gray-300 bg-white text-gray-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  
                  {/* Candidate Image */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt={entry.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-lg font-bold text-gray-400">
                          {entry.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-200">
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {entry.candidateId === "abstain" ? "No selection" : "Candidate"}
                    </p>
                  </div>
                </div>
                
                {/* Vote Count */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{entry.votes}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-500">
                    {totalVotes > 0 ? `${Math.round((entry.votes / totalVotes) * 100)}% of votes` : "Awaiting votes"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
