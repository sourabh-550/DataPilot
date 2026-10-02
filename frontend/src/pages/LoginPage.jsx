import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Eye, EyeOff, Loader2, AlertCircle, Check, UserRound } from "lucide-react";

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInAsGuest } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [successState, setSuccessState] = useState(false);

  const validateEmail = () => {
    if (!email) { setEmailError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setError("Check your email to confirm your account!");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setSuccessState(true);
        setTimeout(() => navigate("/"), 900);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleGuestLogin = async () => {
    setError(null);
    setGuestLoading(true);
    const { error } = await signInAsGuest();
    setGuestLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccessState(true);
    setTimeout(() => navigate("/"), 900);
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    setEmailError("");
  };

  // The sign-up confirmation is reported through `error` — show it as success.
  const isSuccessMessage = error?.includes("Check your email");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold text-fg">DataPilot</span>
        </div>

        <div className="card p-6">
          {successState ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm text-fg" role="status">
              <Check className="h-4 w-4 text-positive" />
              Signed in. Redirecting…
            </p>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-fg">
                {isSignup ? "Create your account" : "Sign in to DataPilot"}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                Ask questions about your CSV, Excel and SQL data.
              </p>

              <div className="mt-5 space-y-2">
                <button type="button" onClick={handleGoogleLogin} className="btn-secondary w-full">
                  <GoogleLogo />
                  Continue with Google
                </button>
                <button type="button" onClick={handleGuestLogin} disabled={guestLoading} className="btn-secondary w-full">
                  {guestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
                  Try as guest — no sign-up
                </button>
              </div>

              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-fg-subtle">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-fg-muted">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    onBlur={() => email && validateEmail()}
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={`input-field ${emailError ? "!border-negative focus:!ring-negative/20" : ""}`}
                  />
                  {emailError && <span id="email-error" className="mt-1 block text-xs text-negative">{emailError}</span>}
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-fg-muted">Password</span>
                  <span className="relative block">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-fg-subtle hover:text-fg"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                {error && (
                  <div
                    className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                      isSuccessMessage
                        ? "border-positive/25 bg-positive/10 text-positive"
                        : "border-negative/25 bg-negative/10 text-negative"
                    }`}
                    role="alert"
                    aria-live="polite"
                  >
                    {isSuccessMessage
                      ? <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? (isSignup ? "Creating account…" : "Signing in…")
                    : (isSignup ? "Create account" : "Sign in")}
                </button>
              </form>
            </>
          )}
        </div>

        {!successState && (
          <p className="mt-4 text-center text-sm text-fg-muted">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={switchMode} className="font-medium text-accent-text hover:underline">
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
