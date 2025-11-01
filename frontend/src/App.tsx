import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OtpPage } from "./pages/OtpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { VotingPage } from "./pages/VotingPage";
import { AccountPage } from "./pages/AccountPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { CandidateEditorPage } from "./pages/CandidateEditorPage";
import { ManageElectionsPage } from "./pages/ManageElectionsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { AdminRoute } from "./components/routing/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="verify" element={<OtpPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="vote" element={<VotingPage />} />
                  <Route path="account" element={<AccountPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<AdminDashboardPage />} />
                  <Route path="admin/candidates" element={<CandidateEditorPage />} />
                  <Route path="admin/elections" element={<ManageElectionsPage />} />
                  <Route path="admin/analytics" element={<AnalyticsPage />} />
                  <Route path="admin/settings" element={<SettingsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
