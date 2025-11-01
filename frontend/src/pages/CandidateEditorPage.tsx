import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, X, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { 
  getCandidates, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate, 
  type Candidate, 
  getElections,
  getPositionsByElection,
  createPosition,
} from "../api/admin";
import { getErrorMessage } from "../utils/errors";

// Common position titles for student council
const POSITION_TITLES = [
  "Chairperson",
  "Vice Chairperson",
  "Secretary",
  "Treasurer",
  "Auditor",
  "1st Year Representative",
  "2nd Year Representative",
  "3rd Year Representative",
  "4th Year Representative",
  "Public Relations Officer",
  "Representative",
];

interface CandidateForm {
  id?: string;
  name: string;
  position_id: string;
  position_title?: string; // For display purposes when creating new candidate
  election_id?: string; // For creating new position
  college: string;
  imageUrl?: string;
  description: string;
  pastLeadership: string;
  grades: string;
  qualifications: string;
}

// Parse platform string from database format
function parsePlatform(platform: string): { description: string; pastLeadership: string; grades: string; qualifications: string } {
  const parts = platform.split('|').map(p => p.trim());
  return {
    description: parts[0] || '',
    pastLeadership: parts[1] || '',
    grades: parts[2] || '',
    qualifications: parts[3] || '',
  };
}

// Build platform string for database
function buildPlatform(form: CandidateForm): string {
  return `${form.description}|${form.pastLeadership}|${form.grades}|${form.qualifications}`;
}

export function CandidateEditorPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateForm | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionTitle, setNewPositionTitle] = useState("");

  // Fetch candidates with auto-refresh
  const candidatesQuery = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const response = await getCandidates();
      return response.candidates;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Fetch elections
  const electionsQuery = useQuery({
    queryKey: ["elections"],
    queryFn: async () => {
      const response = await getElections();
      return response.elections;
    },
    refetchInterval: 5000,
  });

  // Fetch positions for selected election
  const positionsQuery = useQuery({
    queryKey: ["positions", selectedElectionId],
    queryFn: async () => {
      if (!selectedElectionId) return [];
      const response = await getPositionsByElection(selectedElectionId);
      return response.positions;
    },
    enabled: !!selectedElectionId,
    refetchInterval: 5000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["elections"] }); // Invalidate elections too
      setIsEditing(false);
      setEditingCandidate(null);
      setImagePreview(null);
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      setIsEditing(false);
      setEditingCandidate(null);
      setImagePreview(null);
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["elections"] });
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  // Create position mutation
  const createPositionMutation = useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions", selectedElectionId] });
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const handleAddCommonPositions = async () => {
    if (!selectedElectionId) {
      setError("Please select an election first");
      return;
    }

    if (!confirm("This will add all common student council positions to this election. Continue?")) {
      return;
    }

    try {
      for (let i = 0; i < POSITION_TITLES.length; i++) {
        await createPositionMutation.mutateAsync({
          election_id: selectedElectionId,
          title: POSITION_TITLES[i],
          display_order: i + 1,
        });
      }
      alert("Common positions added successfully!");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddSinglePosition = async () => {
    if (!selectedElectionId) {
      setError("Please select an election first");
      return;
    }

    if (!newPositionTitle.trim()) {
      setError("Please enter a position title");
      return;
    }

    try {
      await createPositionMutation.mutateAsync({
        election_id: selectedElectionId,
        title: newPositionTitle.trim(),
      });
      setNewPositionTitle("");
      setShowAddPosition(false);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddNew = () => {
    setEditingCandidate({
      name: "",
      position_id: "",
      position_title: "",
      election_id: "",
      college: "",
      description: "",
      pastLeadership: "",
      grades: "",
      qualifications: "",
    });
    setIsEditing(true);
    setImagePreview(null);
    setError(null);
  };

  const handleEdit = (candidate: Candidate) => {
    const platformData = parsePlatform(candidate.platform || '');
    
    // Set the election ID from the candidate's position
    if (candidate.positions?.election_id) {
      setSelectedElectionId(candidate.positions.election_id);
    }
    
    setEditingCandidate({
      id: candidate.id,
      name: candidate.name,
      position_id: candidate.position_id,
      position_title: candidate.positions?.title || '',
      college: candidate.positions?.elections?.institute_id || '',
      imageUrl: candidate.image_url || undefined,
      ...platformData,
    });
    setImagePreview(candidate.image_url || null);
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = () => {
    if (!editingCandidate || !editingCandidate.name || !editingCandidate.position_id) {
      setError("Please select an election and position, and enter candidate name");
      return;
    }

    const platform = buildPlatform(editingCandidate);
    const data = {
      name: editingCandidate.name,
      position_id: editingCandidate.position_id,
      platform,
      image_url: editingCandidate.imageUrl,
    };

    if (editingCandidate.id) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCandidate(null);
    setImagePreview(null);
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        if (editingCandidate) {
          setEditingCandidate({
            ...editingCandidate,
            imageUrl: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
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
                Candidate Editor
              </h1>
              {candidatesQuery.isFetching && (
                <span className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Manage candidates for elections • Auto-refresh every 5s
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Candidate
          </Button>
        )}
      </div>

      {/* Editor Form */}
      {isEditing && editingCandidate && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {editingCandidate.id ? "Edit Candidate" : "Add New Candidate"}
          </h2>

          {/* Important Notice */}
          {!editingCandidate.id && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Select an election first, then choose from the available positions for that election. If no positions are available, create them in Manage Elections first.
              </p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Image Upload */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="image">Candidate Photo</Label>
                <div className="mt-2 flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative h-64 w-64 overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                          Upload photo
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Choose Photo
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={editingCandidate.name}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Juan Dela Cruz"
                  required
                />
              </div>

              <div>
                <Label htmlFor="election">Election *</Label>
                <select
                  id="election"
                  value={selectedElectionId}
                  onChange={(e) => {
                    setSelectedElectionId(e.target.value);
                    // Reset position when election changes
                    setEditingCandidate({
                      ...editingCandidate,
                      position_id: "",
                      position_title: "",
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                  disabled={!!editingCandidate.id} // Disable when editing existing candidate
                >
                  <option value="">Select Election</option>
                  {electionsQuery.data?.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
                {editingCandidate.id && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Election cannot be changed for existing candidates
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="position_id">Position *</Label>
                <select
                  id="position_id"
                  value={editingCandidate.position_id || ''}
                  onChange={(e) => {
                    const selectedPosition = positionsQuery.data?.find(p => p.id === e.target.value);
                    setEditingCandidate({
                      ...editingCandidate,
                      position_id: e.target.value,
                      position_title: selectedPosition?.title || '',
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                  disabled={!selectedElectionId && !editingCandidate.id}
                >
                  <option value="">
                    {!selectedElectionId && !editingCandidate.id 
                      ? "Select an election first" 
                      : "Select Position"}
                  </option>
                  {positionsQuery.data?.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
                {positionsQuery.isLoading && selectedElectionId && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Loading positions...
                  </p>
                )}
                {positionsQuery.data && positionsQuery.data.length > 0 && selectedElectionId && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {positionsQuery.data.length} position(s) available: {positionsQuery.data.map(p => p.title).join(', ')}
                  </p>
                )}
                {positionsQuery.data?.length === 0 && selectedElectionId && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      No positions found for this election.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddCommonPositions}
                        disabled={createPositionMutation.isPending}
                        className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                      >
                        {createPositionMutation.isPending ? "Adding..." : "Add All Common Positions"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPosition(!showAddPosition)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        {showAddPosition ? "Cancel" : "Add Single Position"}
                      </button>
                    </div>
                  </div>
                )}
                {selectedElectionId && positionsQuery.data && positionsQuery.data.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPosition(!showAddPosition)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {showAddPosition ? "Cancel" : "+ Add Another Position"}
                    </button>
                  </div>
                )}
                {showAddPosition && selectedElectionId && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <Label htmlFor="newPosition" className="text-xs">New Position Title</Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="newPosition"
                        value={newPositionTitle}
                        onChange={(e) => setNewPositionTitle(e.target.value)}
                        placeholder="e.g., Business Manager"
                        className="flex-1 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSinglePosition();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSinglePosition}
                        disabled={createPositionMutation.isPending || !newPositionTitle.trim()}
                        className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="college">College/Institute</Label>
                <Input
                  id="college"
                  value={editingCandidate.college}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      college: e.target.value,
                    })
                  }
                  placeholder="e.g., CCIS"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Determined by election
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={editingCandidate.description}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the candidate..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pastLeadership">Past Leadership Experience *</Label>
                <textarea
                  id="pastLeadership"
                  value={editingCandidate.pastLeadership}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      pastLeadership: e.target.value,
                    })
                  }
                  placeholder="e.g., President - Student Council (2023-2024)"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="grades">Academic Performance *</Label>
                <Input
                  id="grades"
                  value={editingCandidate.grades}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      grades: e.target.value,
                    })
                  }
                  placeholder="e.g., GWA: 1.45 (Dean's Lister)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="qualifications">Other Qualifications *</Label>
                <textarea
                  id="qualifications"
                  value={editingCandidate.qualifications}
                  onChange={(e) =>
                    setEditingCandidate({
                      ...editingCandidate,
                      qualifications: e.target.value,
                    })
                  }
                  placeholder="e.g., Certifications, awards, skills..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  required
                />
              </div>
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
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Candidate"}
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
      {!isEditing && candidatesQuery.isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Error State */}
      {!isEditing && candidatesQuery.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-lg text-red-600 dark:text-red-400">
            Error loading candidates: {getErrorMessage(candidatesQuery.error)}
          </p>
        </div>
      )}

      {/* Candidates List */}
      {!isEditing && candidatesQuery.data && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {candidatesQuery.data.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onEdit={() => handleEdit(candidate)}
              onDelete={() => handleDelete(candidate.id)}
            />
          ))}
        </div>
      )}

      {!isEditing && candidatesQuery.data && candidatesQuery.data.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-lg text-gray-600 dark:text-slate-400">
            No candidates yet. Click "Add Candidate" to get started.
          </p>
        </div>
      )}
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: () => void;
  onDelete: () => void;
}

function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  const platformData = parsePlatform(candidate.platform || '');
  const positionTitle = candidate.positions?.title || 'Unknown Position';
  const instituteId = candidate.positions?.elections?.institute_id || '';

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {/* Image */}
      <div className="mb-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
        {candidate.image_url ? (
          <img
            src={candidate.image_url}
            alt={candidate.name}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">
              {candidate.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {candidate.name}
      </h3>
      <p className="mt-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
        {positionTitle} {instituteId && `- ${instituteId.toUpperCase()}`}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
        {platformData.description}
      </p>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Edit className="mx-auto h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="flex-1 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
