import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * AdminRoute component protects routes that require admin role.
 * Redirects to login if not authenticated, or to dashboard if not admin.
 */
export function AdminRoute() {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
