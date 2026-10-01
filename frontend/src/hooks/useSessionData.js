import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getSession } from "../services/api";

// Builds the URL for a dataset page, e.g. sessionPath("/chat", id) → "/chat?session=<id>".
// The id lives in the URL so refreshes, History links and bookmarks all work.
export const sessionPath = (path, sessionId) => `${path}?session=${encodeURIComponent(sessionId)}`;

/**
 * Resolves the dataset session for /chat and /explorer.
 * - Router state from a fresh upload already has the full data → used instantly.
 * - Otherwise (History link, refresh, bookmark) it's fetched from GET /sessions/:id.
 * Results are keyed by session id, so switching datasets never shows stale data.
 */
export function useSessionData() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stateData = location.state?.sessionData;
  const sessionId = searchParams.get("session") || stateData?.session_id || null;
  const stateIsComplete = Boolean(stateData?.summary) && stateData.session_id === sessionId;

  const [fetched, setFetched] = useState(null); // { sessionId, data } | { sessionId, error }

  useEffect(() => {
    if (!sessionId) {
      navigate("/upload", { replace: true });
      return;
    }
    if (stateIsComplete) return;

    let cancelled = false;
    getSession(sessionId)
      .then((data) => {
        if (!cancelled) setFetched({ sessionId, data });
      })
      .catch((err) => {
        const detail = err.response?.data?.detail;
        if (!cancelled) {
          setFetched({
            sessionId,
            error: typeof detail === "string" ? detail : "Couldn't open this dataset. Please try again.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [sessionId, stateIsComplete, navigate]);

  if (stateIsComplete) return { sessionData: stateData, loading: false, error: null };
  const current = fetched?.sessionId === sessionId ? fetched : null;
  return { sessionData: current?.data ?? null, loading: !current, error: current?.error ?? null };
}
