import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Shown for a moment while Supabase restores the session.
function SessionLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-fg-subtle" role="status">
      Loading…
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <SessionLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
