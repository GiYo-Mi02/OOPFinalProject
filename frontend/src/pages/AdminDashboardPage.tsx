import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  UserPlus,
  TrendingUp,
  FileText,
  RefreshCcw
} from "lucide-react";
import { getAnalytics, getElections, getCandidates } from "../api/admin";
import { getErrorMessage } from "../utils/errors";

export function AdminDashboardPage() {
  // Fetch analytics data with auto-refresh
  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await getAnalytics();
      return response;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Fetch elections to get total count
  const electionsQuery = useQuery({
    queryKey: ["elections"],
    queryFn: async () => {
      const response = await getElections();
      return response.elections;
    },
    refetchInterval: 5000,
  });

  // Fetch candidates to get total count
  const candidatesQuery = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const response = await getCandidates();
      return response.candidates;
    },
    refetchInterval: 5000,
  });

  const stats = analyticsQuery.data?.stats || {
    totalVoters: 0,
    votesCast: 0,
    turnoutRate: 0,
    activeElections: 0,
    completedElections: 0,
  };

  const totalElections = electionsQuery.data?.length || 0;
  const totalCandidates = candidatesQuery.data?.length || 0;

  // Get recent elections for activity feed
  const recentElections = electionsQuery.data?.slice(0, 3) || [];

  const isLoading = analyticsQuery.isLoading || electionsQuery.isLoading || candidatesQuery.isLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (analyticsQuery.error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            Error loading dashboard
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(analyticsQuery.error)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            {(analyticsQuery.isFetching || electionsQuery.isFetching || candidatesQuery.isFetching) && (
              <span className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Manage elections, candidates, and monitor voting activity • Auto-refresh every 5s
          </p>
        </div>
        <Link
          to="/admin/elections/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          New Election
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          label="Active Elections"
          value={stats.activeElections}
          total={totalElections}
          color="blue"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Total Candidates"
          value={totalCandidates}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Voter Turnout"
          value={`${stats.turnoutRate.toFixed(1)}%`}
          subtitle={`${stats.votesCast} / ${stats.totalVoters} voters`}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            to="/admin/candidates"
            icon={<UserPlus className="h-6 w-6" />}
            title="Manage Candidates"
            description="Add, edit, or remove candidates"
            color="from-blue-500 to-blue-600"
          />
          <ActionCard
            to="/admin/elections"
            icon={<Calendar className="h-6 w-6" />}
            title="Manage Elections"
            description="Create and configure elections"
            color="from-purple-500 to-purple-600"
          />
          <ActionCard
            to="/admin/analytics"
            icon={<BarChart3 className="h-6 w-6" />}
            title="View Analytics"
            description="Monitor voting trends"
            color="from-emerald-500 to-emerald-600"
          />
          <ActionCard
            to="/admin/settings"
            icon={<Settings className="h-6 w-6" />}
            title="Settings"
            description="Configure system settings"
            color="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Recent Elections
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {recentElections.length > 0 ? (
            <div className="space-y-4">
              {recentElections.map((election) => {
                const icon = election.status === 'active' 
                  ? <TrendingUp className="h-5 w-5 text-green-500" />
                  : election.status === 'completed'
                  ? <FileText className="h-5 w-5 text-gray-500" />
                  : <Calendar className="h-5 w-5 text-blue-500" />;
                
                const title = election.status === 'active'
                  ? 'Active Election'
                  : election.status === 'completed'
                  ? 'Completed Election'
                  : 'Upcoming Election';

                const timeAgo = new Date(election.created_at).toLocaleDateString();

                return (
                  <ActivityItem
                    key={election.id}
                    icon={icon}
                    title={title}
                    description={`${election.title} - ${election.institute_id.toUpperCase()}`}
                    time={timeAgo}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400">
              No recent elections
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  total?: number;
  subtitle?: string;
  color: "blue" | "purple" | "green";
}

function StatCard({ icon, label, value, total, subtitle, color }: StatCardProps) {
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-gradient-to-br ${colorMap[color]} p-3 text-white`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
          {total && <span className="text-xl text-gray-500 dark:text-slate-500"> / {total}</span>}
        </p>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface ActionCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function ActionCard({ to, icon, title, description, color }: ActionCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white`}>
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-slate-400">{description}</p>
      </div>
      <span className="text-sm text-gray-500 dark:text-slate-500">{time}</span>
    </div>
  );
}
