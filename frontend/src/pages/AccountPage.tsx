import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Label } from "../components/ui/Label";
import { useAuth } from "../contexts/AuthContext";
import { getInstitutes } from "../api/admin";
import { updateUserInstitute } from "../api/user";
import { getErrorMessage } from "../utils/errors";

export function AccountPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedInstitute, setSelectedInstitute] = useState(user?.instituteId || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch institutes from the database
  const institutesQuery = useQuery({
    queryKey: ["institutes"],
    queryFn: getInstitutes,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const institutes = institutesQuery.data?.institutes || [];

  // Update institute mutation
  const updateMutation = useMutation({
    mutationFn: (instituteId: string) => updateUserInstitute(instituteId),
    onSuccess: async (response: any) => {
      // Update user in localStorage
      if (response.user && user) {
        const updatedUser = { ...user, instituteId: response.user.institute_id };
        localStorage.setItem("umak-eballot:user", JSON.stringify(updatedUser));
      }
      await refreshUser(); // Refresh user data in context
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setSuccess(true);
      setError(null);
      setShowConfirmModal(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setShowConfirmModal(false);
    },
  });

  const handleSelectInstitute = (instituteCode: string) => {
    if (user?.instituteId) {
      // If user already has an institute, show warning
      setError("Warning: Changing your college/institute may affect your voting eligibility. You can only change this once.");
    }
    setSelectedInstitute(instituteCode);
  };

  const handleSave = () => {
    if (!selectedInstitute) {
      setError("Please select a college/institute");
      return;
    }

    if (selectedInstitute === user?.instituteId) {
      setError("This is already your current college/institute");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmSelection = () => {
    updateMutation.mutate(selectedInstitute);
  };

  const selectedInstituteData = institutes.find(i => i.code === selectedInstitute);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          Manage your account information and college/institute affiliation
        </p>
      </div>

      {/* Account Information Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Account Information
        </h2>

        <div className="space-y-6">
          {/* Email - Read Only */}
          <div>
            <Label>Email Address</Label>
            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user?.email}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Your UMak email address
            </p>
          </div>

          {/* Role - Read Only */}
          <div>
            <Label>Account Type</Label>
            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>

          {/* Current Institute - Read Only */}
          {user?.instituteId && (
            <div>
              <Label>Current College/Institute</Label>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {institutes.find(i => i.code === user.instituteId)?.name || user.instituteId.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Your registered college/institute
              </p>
            </div>
          )}
        </div>
      </div>

      {/* College/Institute Selection Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user?.instituteId ? "Change" : "Select"} College/Institute
          </h2>
        </div>

        {!user?.instituteId && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-semibold">Action Required:</p>
                <p className="mt-1">
                  You must select your college/institute to vote and view election data. 
                  Choose carefully - you can only change this once!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <Label htmlFor="institute">Select Your College/Institute *</Label>
            <select
              id="institute"
              value={selectedInstitute}
              onChange={(e) => handleSelectInstitute(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={institutesQuery.isLoading || updateMutation.isPending}
            >
              <option value="">-- Select College/Institute --</option>
              {institutes.map((institute) => (
                <option key={institute.code} value={institute.code}>
                  {institute.code.toUpperCase()} - {institute.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              This determines which elections and candidates you can see and vote for
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  College/Institute updated successfully!
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!selectedInstitute || selectedInstitute === user?.instituteId || updateMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/30 dark:bg-blue-500/10">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200">
          Important Information:
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
            <span>You can only vote in elections for your selected college/institute</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
            <span>You will only see leaderboards and candidates from your college/institute</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
            <span>Once set, you can only change your college/institute one time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
            <span>Make sure to select the correct college/institute before confirming</span>
          </li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/20">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirm Your Selection
            </h3>
            
            <div className="mt-4 space-y-4">
              <p className="text-gray-600 dark:text-slate-400">
                You are about to set your college/institute to:
              </p>
              
              <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-500/30 dark:bg-primary-500/10">
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {selectedInstituteData?.code.toUpperCase()}
                </p>
                <p className="mt-1 text-lg font-bold text-primary-900 dark:text-primary-200">
                  {selectedInstituteData?.name}
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-500/10">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  ⚠️ Important:
                </p>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  This action can only be changed once. Make sure this is the correct college/institute before confirming.
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-400">
                Are you sure you want to proceed?
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSelection}
                className="flex-1 gap-2"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  "Confirming..."
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
