// Recent datasets are cached in localStorage under a per-user key, so a browser
// shared by several accounts (or a guest) never shows someone else's uploads.
// The cache holds sample rows of the user's data, so it is wiped on sign-out.

const PREFIX = "datapilot-datasets";
const LEGACY_KEY = "datapilot-datasets"; // old unscoped key — its owner is unknown
const MAX_ENTRIES = 20;

const keyFor = (userId) => `${PREFIX}:${userId}`;

export function getRecentDatasets(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || "[]");
  } catch {
    return [];
  }
}

export function addRecentDataset(userId, entry) {
  if (!userId) return;
  try {
    const rest = getRecentDatasets(userId).filter((d) => d.session_id !== entry.session_id);
    localStorage.setItem(keyFor(userId), JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)));
  } catch {
    /* storage full or blocked — the cache is optional */
  }
}

export function removeRecentDataset(userId, sessionId) {
  if (!userId) return;
  try {
    const rest = getRecentDatasets(userId).filter((d) => d.session_id !== sessionId);
    localStorage.setItem(keyFor(userId), JSON.stringify(rest));
  } catch {
    /* ignore */
  }
}

export function removeLegacyRecentDatasets() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export function clearRecentDatasets() {
  try {
    // Collect keys first — removing while iterating by index would skip entries.
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    keys
      .filter((k) => k === LEGACY_KEY || k.startsWith(`${PREFIX}:`))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
