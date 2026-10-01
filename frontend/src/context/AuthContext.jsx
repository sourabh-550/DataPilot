import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { clearRecentDatasets, removeLegacyRecentDatasets } from "../utils/recentDatasets";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The old unscoped cache could hold another account's datasets — drop it.
    removeLegacyRecentDatasets();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes. SIGNED_OUT fires for every sign-out path
    // (menu button, expired token via the 401 interceptor), so clear here.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") clearRecentDatasets();
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  // Guest mode — Supabase anonymous sign-in. The guest gets a real user id and JWT
  // (so uploads/history work), but no email. Requires "Allow anonymous sign-ins"
  // to be enabled in the Supabase dashboard.
  const signInAsGuest = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    isGuest: Boolean(user?.is_anonymous),
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}