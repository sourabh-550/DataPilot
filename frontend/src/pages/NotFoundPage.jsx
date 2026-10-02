import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <p className="text-sm font-medium tabular-nums text-fg-subtle">404</p>
      <h1 className="mt-2 text-xl font-semibold text-fg">Page not found</h1>
      <p className="mt-1 max-w-xs text-sm text-fg-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex gap-2">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Dashboard
        </button>
      </div>
    </div>
  );
}
