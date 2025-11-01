import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Vote,
  BarChart3,
  PieChart,
  Download,
  RefreshCcw
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { getAnalytics } from "../api/admin";
import { getErrorMessage } from "../utils/errors";

export function AnalyticsPage() {
  // Fetch analytics with auto-refresh
  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await getAnalytics();
      return response;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const stats = analyticsQuery.data?.stats || {
    totalVoters: 0,
    votesCast: 0,
    turnoutRate: 0,
    activeElections: 0,
    completedElections: 0,
  };

  // Convert instituteBreakdown Record to array
  const instituteBreakdown = analyticsQuery.data?.instituteBreakdown 
    ? Object.entries(analyticsQuery.data.instituteBreakdown).map(([name, votes]) => ({
        name: name.toUpperCase(),
        votes,
        voters: 0, // We don't have voters per institute from backend yet
        turnout: 0, // Calculate if we had voters
      }))
    : [];

  // Convert hourlyVotes Record to array
  const hourlyVotes = analyticsQuery.data?.hourlyVotes
    ? Object.entries(analyticsQuery.data.hourlyVotes).map(([hour, votes]) => ({
        hour,
        votes,
      }))
    : [];

  const maxVotes = hourlyVotes.length > 0 ? Math.max(...hourlyVotes.map(h => h.votes)) : 1;

  // Loading state
  if (analyticsQuery.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (analyticsQuery.error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-lg text-red-600 dark:text-red-400">
            Error loading analytics: {getErrorMessage(analyticsQuery.error)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Reports
              </h1>
              {analyticsQuery.isFetching && (
                <span className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Monitor voting trends and engagement metrics • Auto-refresh every 5s
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
              Live data • Last updated {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <Button className="gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={<Users className="h-6 w-6" />}
          label="Total Registered Voters"
          value={stats.totalVoters.toLocaleString()}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          icon={<Vote className="h-6 w-6" />}
          label="Votes Cast"
          value={stats.votesCast.toLocaleString()}
          color="from-emerald-500 to-emerald-600"
        />
        <MetricCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Turnout Rate"
          value={`${stats.turnoutRate}%`}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Institute Breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white">
              <PieChart className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Institute Breakdown
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {instituteBreakdown.map((institute) => (
            <div
              key={institute.name}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {institute.name}
                  </span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {institute.turnout}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                    style={{ width: `${institute.turnout}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  {institute.votes.toLocaleString()} / {institute.voters.toLocaleString()} voters
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Voting Pattern */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hourly Voting Pattern
          </h2>
        </div>

        <div className="space-y-3">
          {hourlyVotes.map((item) => (
            <div key={item.hour} className="flex items-center gap-4">
              <span className="w-16 text-sm font-semibold text-gray-700 dark:text-slate-300">
                {item.hour}
              </span>
              <div className="relative flex-1">
                <div className="h-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                    style={{ width: `${(item.votes / maxVotes) * 100}%` }}
                  />
                </div>
                <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold text-white">
                  {item.votes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">
            Active Elections
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.activeElections}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">
            Completed Elections
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completedElections}
          </p>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-gradient-to-br ${color} p-3 text-white`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
