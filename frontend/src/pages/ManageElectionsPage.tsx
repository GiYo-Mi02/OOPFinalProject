import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Users,
  Save,
  X,
  Play,
  CheckCircle,
  RefreshCcw
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { getElections, createElection, updateElection, deleteElection, getInstitutes, type Election } from "../api/admin";
import { getErrorMessage } from "../utils/errors";

export function ManageElectionsPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingElection, setEditingElection] = useState<Partial<Election> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch elections with auto-refresh
  const electionsQuery = useQuery({
    queryKey: ["elections"],
    queryFn: async () => {
      const response = await getElections();
      return response.elections;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Fetch institutes
  const institutesQuery = useQuery({
    queryKey: ["institutes"],
    queryFn: async () => {
      const response = await getInstitutes();
      return response.institutes;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createElection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      setIsEditing(false);
      setEditingElection(null);
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateElection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      setIsEditing(false);
      setEditingElection(null);
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteElection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const handleAddNew = () => {
    setEditingElection({
      title: "",
      description: "",
      institute_id: "",
      start_date: "",
      end_date: "",
      status: "upcoming"
    });
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (election: Election) => {
    setEditingElection({
      ...election,
      start_date: new Date(election.start_date).toISOString().slice(0, 16),
      end_date: new Date(election.end_date).toISOString().slice(0, 16),
    });
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this election? This will also delete all associated positions, candidates, and votes.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!editingElection || !editingElection.title || !editingElection.institute_id || !editingElection.start_date || !editingElection.end_date) {
      setError("Please fill in all required fields");
      return;
    }

    const data = {
      title: editingElection.title,
      description: editingElection.description || "",
      institute_id: editingElection.institute_id,
      start_date: editingElection.start_date,
      end_date: editingElection.end_date,
      status: editingElection.status as "upcoming" | "active" | "completed",
    };

    if (editingElection.id) {
      updateMutation.mutate({ id: editingElection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingElection(null);
    setError(null);
  };

  const getStatusBadge = (status: Election["status"]) => {
    const styles = {
      upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return styles[status];
  };

  const getStatusIcon = (status: Election["status"]) => {
    const icons = {
      upcoming: <Clock className="h-4 w-4" />,
      active: <Play className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />
    };
    return icons[status];
  };

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
                Manage Elections
              </h1>
              {electionsQuery.isFetching && (
                <span className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Create and configure elections with dates and institutes • Auto-refresh every 5s
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-5 w-5" />
            New Election
          </Button>
        )}
      </div>

      {/* Editor Form */}
      {isEditing && editingElection && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {editingElection.id ? "Edit Election" : "Create New Election"}
          </h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Election Title *</Label>
              <Input
                id="title"
                value={editingElection.title}
                onChange={(e) =>
                  setEditingElection({
                    ...editingElection,
                    title: e.target.value,
                  })
                }
                placeholder="e.g., CCIS Student Council Election 2025"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={editingElection.description}
                onChange={(e) =>
                  setEditingElection({
                    ...editingElection,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of the election..."
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <Label htmlFor="institute">College/Institute *</Label>
              <select
                id="institute"
                value={editingElection.institute_id}
                onChange={(e) =>
                  setEditingElection({
                    ...editingElection,
                    institute_id: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value="">Select institute</option>
                {institutesQuery.isLoading && (
                  <option disabled>Loading institutes...</option>
                )}
                {institutesQuery.data?.map((institute) => (
                  <option key={institute.code} value={institute.code}>
                    {institute.code.toUpperCase()} - {institute.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={editingElection.start_date}
                  onChange={(e) =>
                    setEditingElection({
                      ...editingElection,
                      start_date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={editingElection.end_date}
                  onChange={(e) =>
                    setEditingElection({
                      ...editingElection,
                      end_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={editingElection.status}
                onChange={(e) =>
                  setEditingElection({
                    ...editingElection,
                    status: e.target.value as Election["status"],
                  })
                }
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Election"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {!isEditing && electionsQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Error State */}
      {!isEditing && electionsQuery.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-lg text-red-600 dark:text-red-400">
            Error loading elections: {getErrorMessage(electionsQuery.error)}
          </p>
        </div>
      )}

      {/* Elections List */}
      {!isEditing && electionsQuery.data && (
        <div className="grid gap-6">
          {electionsQuery.data.map((election) => (
            <div
              key={election.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {election.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(election.status)}`}>
                      {getStatusIcon(election.status)}
                      {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-slate-400">
                    {election.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{election.institute_id.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(election.start_date).toLocaleString()} - {new Date(election.end_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(election)}
                    className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(election.id)}
                    className="rounded-lg border border-red-300 bg-white p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEditing && electionsQuery.data && electionsQuery.data.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-lg text-gray-600 dark:text-slate-400">
            No elections yet. Click "New Election" to create one.
          </p>
        </div>
      )}
    </div>
  );
}
