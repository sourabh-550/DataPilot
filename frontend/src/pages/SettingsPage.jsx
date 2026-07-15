import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  ChevronRight,
  Check,
  Zap,
  Globe,
  Moon,
  Sun,
  Monitor,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getProfile, updateProfile } from "../services/api";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api", label: "API & Integrations", icon: Key },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Storage", icon: Database },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("profile");
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
    <DashboardLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-6"
        >
          {/* Settings Sidebar */}
          <div className="hidden sm:flex flex-col w-52 shrink-0 space-y-1">
            {SECTIONS.map((section, i) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
                {activeSection === section.id && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="flex-1 min-w-0">
            {activeSection === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Profile</h3>
                  <p className="text-sm text-zinc-500">Manage your personal information</p>
                </div>

                {loading ? (
                  <div className="card rounded-2xl p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm px-4 py-3">
                        {error}
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="card rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow">
                            {(profileForm.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-zinc-900 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{profileForm.name || "Unnamed"}</p>
                          <p className="text-sm text-zinc-500">{profileForm.role || "No role set"}</p>
                          <span className="badge-primary text-[10px] mt-1">Pro Plan</span>
                        </div>
                        <button className="btn-outline ml-auto rounded-xl text-sm gap-2 px-4 py-2">
                          Change Avatar
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {Object.entries(profileForm).map(([key, val]) => (
                          <div key={key}>
                            <label className="text-xs font-medium text-zinc-400 capitalize block mb-1.5">
                              {key}
                            </label>
                            <input
                              type={key === "email" ? "email" : "text"}
                              value={val}
                              disabled={key === "email"}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, [key]: e.target.value })
                              }
                              className={`input-field py-2.5 ${
                                key === "email" ? "opacity-60 cursor-not-allowed" : ""
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary gap-2 rounded-2xl disabled:opacity-60"
                        whileHover={{ scale: saving ? 1 : 1.03 }}
                        whileTap={{ scale: saving ? 1 : 0.97 }}
                      >
                        {saving ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                        ) : saved ? (
                          <><Check className="w-4 h-4" />Saved!</>
                        ) : (
                          <><Zap className="w-4 h-4" />Save Changes</>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeSection === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Appearance</h3>
                  <p className="text-sm text-zinc-500">Customize the look and feel</p>
                </div>

                <div className="card rounded-2xl p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-4">Theme</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "light", label: "Light", icon: Sun },
                        { id: "system", label: "System", icon: Monitor },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => t.id !== "system" && theme !== t.id && toggleTheme()}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            (t.id === "system" ? false : theme === t.id)
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <t.icon className={`w-5 h-5 ${
                            (t.id === "system" ? false : theme === t.id) ? "text-indigo-400" : "text-zinc-500"
                          }`} />
                          <span className="text-xs font-medium text-zinc-400">{t.label}</span>
                          {(t.id !== "system" && theme === t.id) && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-4">Accent Color</h4>
                    <div className="flex gap-3">
                      {[
                        { color: "#6366F1", name: "Indigo" },
                        { color: "#06B6D4", name: "Cyan" },
                        { color: "#22C55E", name: "Green" },
                        { color: "#F59E0B", name: "Amber" },
                        { color: "#EF4444", name: "Red" },
                        { color: "#8B5CF6", name: "Violet" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          title={c.name}
                          className={`w-8 h-8 rounded-xl border-2 transition-all ${
                            c.color === "#6366F1" ? "border-white scale-110" : "border-transparent hover:scale-105"
                          }`}
                          style={{ background: c.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Generic placeholder for other sections */}
            {!["profile", "appearance"].includes(activeSection) && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize mb-1">
                    {SECTIONS.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-sm text-zinc-500">Configure your preferences</p>
                </div>
                <div className="card rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const section = SECTIONS.find(s => s.id === activeSection);
                      return section ? <section.icon className="w-8 h-8 text-zinc-600" /> : null;
                    })()}
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">Coming Soon</h4>
                  <p className="text-sm text-zinc-500">This settings section is under development.</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}