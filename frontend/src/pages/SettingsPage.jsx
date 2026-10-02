import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Check, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getProfile, updateProfile } from "../services/api";

const FIELDS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role", placeholder: "e.g. Data analyst" },
  { key: "company", label: "Company" },
];

function SettingsSection({ title, description, children }) {
  return (
    <section className="card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="mt-0.5 text-sm text-fg-muted">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
  });

  // Fetch the real profile from the backend on mount
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfile();
        if (!cancelled) {
          setProfileForm({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "",
            company: data.company || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load your profile. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Email is intentionally not sent — it's managed by Supabase Auth, not editable here.
      const updated = await updateProfile({
        name: profileForm.name,
        role: profileForm.role,
        company: profileForm.company,
      });
      setProfileForm((prev) => ({ ...prev, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Profile and appearance">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        <SettingsSection title="Profile" description="Your name, role and company.">
          {loading ? (
            <div className="space-y-3" aria-label="Loading profile">
              {[0, 1].map((i) => <div key={i} className="skeleton h-9" />)}
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 rounded-md border border-negative/25 bg-negative/10 px-3 py-2 text-sm text-negative" role="alert">
                  {error}
                </p>
              )}

              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-sunken text-sm font-medium text-fg-muted">
                  {(profileForm.name || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{profileForm.name || "Unnamed"}</p>
                  <p className="truncate text-sm text-fg-muted">{profileForm.role || "No role set"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {FIELDS.map(({ key, label, placeholder }) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-xs font-medium text-fg-muted">{label}</span>
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={profileForm[key]}
                      placeholder={key === "email" ? "Guest account — no email" : placeholder || ""}
                      disabled={key === "email"}
                      onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                      className="input-field"
                    />
                    {key === "email" && (
                      <span className="mt-1 block text-2xs text-fg-subtle">Managed by your sign-in provider</span>
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  ) : saved ? (
                    <><Check className="h-4 w-4" />Saved</>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </>
          )}
        </SettingsSection>

        <SettingsSection title="Appearance" description="Choose a light or dark interface.">
          <div className="inline-flex rounded-md border border-line bg-sunken p-0.5" role="radiogroup" aria-label="Theme">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
            ].map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={theme === t.id}
                onClick={() => theme !== t.id && toggleTheme()}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm transition-colors ${
                  theme === t.id ? "bg-panel font-medium text-fg shadow-xs" : "text-fg-muted hover:text-fg"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </SettingsSection>
      </div>
    </DashboardLayout>
  );
}
