import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Shield,
  Zap,
  BarChart3,
  Database,
  MessageSquareCode,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const shake = {
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

/* ─────────────────────────────────────────────
   FEATURE LIST
───────────────────────────────────────────── */
const features = [
  { icon: Zap, label: "AI-powered analytics", color: "#6366F1" },
  { icon: MessageSquareCode, label: "Natural language SQL", color: "#8B5CF6" },
  { icon: BarChart3, label: "Smart visualizations", color: "#06B6D4" },
  { icon: Shield, label: "Secure cloud authentication", color: "#22C55E" },
  { icon: Database, label: "Fast dataset processing", color: "#F59E0B" },
];

/* ─────────────────────────────────────────────
   FLOATING BLOB COMPONENT
───────────────────────────────────────────── */
function FloatingBlob({ style, delay = 0, duration = 8 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y: [0, -20, 0], scale: [1, 1.04, 1], opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─────────────────────────────────────────────
   ABSTRACT AI ILLUSTRATION
───────────────────────────────────────────── */
function AIIllustration() {
  return (
    <motion.div
      className="relative w-72 h-72 mx-auto"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-indigo-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-violet-500/25"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbiting dot */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_12px_4px_rgba(99,102,241,0.6)]"
        />
      </motion.div>

      {/* Inner ring */}
      <motion.div
        className="absolute inset-16 rounded-full border border-cyan-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_3px_rgba(6,182,212,0.6)]"
        />
      </motion.div>

      {/* Core glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.3) 100%)",
              boxShadow: "0 0 40px -8px rgba(99,102,241,0.8)",
              border: "1px solid rgba(99,102,241,0.4)",
            }}
          >
            <BarChart3 size={24} className="text-indigo-300" />
          </div>
        </motion.div>
      </div>

      {/* Floating mini cards */}
      {[
        { top: "10%", left: "0%", label: "98.4%", sub: "Accuracy", color: "#6366F1" },
        { top: "65%", left: "80%", label: "2.3s", sub: "Query", color: "#22C55E" },
        { top: "80%", left: "5%", label: "1M+", sub: "Rows", color: "#06B6D4" },
      ].map((card, i) => (
        <motion.div
          key={i}
          className="absolute px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
          style={{
            top: card.top,
            left: card.left,
            background: "rgba(24,24,27,0.85)",
            border: `1px solid ${card.color}30`,
            boxShadow: `0 4px 16px -4px ${card.color}40`,
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3 + i, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ color: card.color }}>{card.label}</div>
          <div className="text-zinc-500 text-[10px] font-normal">{card.sub}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING INPUT FIELD
───────────────────────────────────────────── */
function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  icon: Icon,
  suffix,
  error,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <div
        className="relative rounded-2xl transition-all duration-200 overflow-visible"
        style={{
          background: "rgba(24,24,27,0.8)",
          border: `1px solid ${
            error
              ? "rgba(239,68,68,0.5)"
              : focused
              ? "rgba(99,102,241,0.5)"
              : "rgba(63,63,70,0.6)"
          }`,
          boxShadow: focused
            ? error
              ? "0 0 0 3px rgba(239,68,68,0.10)"
              : "0 0 0 3px rgba(99,102,241,0.10), 0 0 20px -8px rgba(99,102,241,0.3)"
            : "none",
        }}
      >
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon
            size={16}
            style={{
              color: error ? "#EF4444" : focused ? "#6366F1" : "#52525B",
              transition: "color 0.2s",
            }}
          />
        </div>

        {/* Floating Label */}
        <label
          htmlFor={id}
          className="absolute left-10 pointer-events-none transition-all duration-200 font-medium"
          style={{
            top: focused || hasValue ? "6px" : "50%",
            transform: focused || hasValue ? "none" : "translateY(-50%)",
            fontSize: focused || hasValue ? "10px" : "14px",
            color: error
              ? "#EF4444"
              : focused
              ? "#818CF8"
              : "#52525B",
          }}
        >
          {label}
        </label>

        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur && onBlur(); }}
          className="w-full bg-transparent text-white text-sm font-medium outline-none"
          style={{
            paddingLeft: "2.5rem",
            paddingRight: suffix ? "3rem" : "1rem",
            paddingTop: focused || hasValue ? "22px" : "14px",
            paddingBottom: focused || hasValue ? "6px" : "14px",
            minHeight: "52px",
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Suffix slot (show/hide button) */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 mt-1.5 ml-1 text-xs font-medium"
            style={{ color: "#F87171" }}
            role="alert"
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────── */
export default function LoginPage() {
  /* ── Auth logic (UNCHANGED) ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  /* ── UI state ── */
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const formRef = useRef(null);

  const validateEmail = () => {
    if (!email) { setEmailError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  /* ── Auth handlers (LOGIC UNCHANGED) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) { triggerShake(); return; }
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
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError(null);
    setEmailError("");
  };

  /* ─────────────────────────────────────
     SUCCESS OVERLAY
  ────────────────────────────────────── */
  if (successState) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#09090B" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              boxShadow: "0 0 60px -10px rgba(34,197,94,0.7)",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: 1 }}
          >
            <Check size={36} className="text-white" strokeWidth={3} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-white"
          >
            Signed in! Redirecting…
          </motion.p>
          <motion.div
            className="h-0.5 w-40 rounded-full"
            style={{ background: "linear-gradient(90deg, #6366F1, #22C55E)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────
     MAIN RENDER
  ────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "#09090B" }}
    >

      {/* ══════════════════════════════════
          LEFT HERO PANEL (desktop only)
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-center px-16 overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(99,102,241,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 70%, rgba(6,182,212,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Blobs */}
        <FloatingBlob
          delay={0} duration={9}
          style={{
            width: 340, height: 340,
            top: "-80px", left: "-80px",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <FloatingBlob
          delay={2} duration={11}
          style={{
            width: 300, height: 300,
            bottom: "80px", right: "-60px",
            background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <FloatingBlob
          delay={4} duration={7}
          style={{
            width: 200, height: 200,
            bottom: "200px", left: "40%",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg">

          {/* Logo */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="flex items-center gap-3 mb-12"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow: "0 0 20px -4px rgba(99,102,241,0.6)",
              }}
            >
              <BarChart3 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Data</span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #818CF8, #A78BFA, #67E8F9)" }}
              >
                Pilot
              </span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl font-bold tracking-tight leading-[1.1] mb-5"
          >
            <span className="text-white">Welcome to</span>{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #67E8F9 100%)",
              }}
            >
              DataPilot
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-lg leading-relaxed mb-10"
            style={{ color: "#A1A1AA" }}
          >
            Transform spreadsheets into AI-powered insights{" "}
            <span className="text-white font-medium">within seconds.</span>
          </motion.p>

          {/* Feature list */}
          <motion.ul className="space-y-3.5 mb-14" initial="hidden" animate="visible">
            {features.map((f, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                custom={3 + i}
                className="flex items-center gap-3.5"
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                  }}
                >
                  <f.icon size={14} style={{ color: f.color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "#D4D4D8" }}>
                  {f.label}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Illustration */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={9}
          >
            <AIIllustration />
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════
          RIGHT PANEL — AUTH CARD
      ══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">

        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <FloatingBlob
            delay={0} duration={9}
            style={{
              width: 300, height: 300, top: "-60px", right: "-60px",
              background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        {/* Vertical separator line (desktop) */}
        <div
          className="hidden lg:block absolute left-0 top-16 bottom-16 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(63,63,70,0.4) 20%, rgba(99,102,241,0.2) 50%, rgba(63,63,70,0.4) 80%, transparent)",
          }}
        />

        {/* Auth Card */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-md z-10"
          ref={formRef}
        >
          <motion.div
            variants={shake}
            animate={isShaking ? "shake" : ""}
            className="rounded-3xl p-8 md:p-10"
            style={{
              background:
                "linear-gradient(145deg, rgba(28,28,32,0.95) 0%, rgba(18,18,21,0.98) 100%)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                "0 24px 64px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 0 rgba(255,255,255,0.08) inset",
            }}
          >

            {/* Card top logo mark */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow:
                    "0 0 30px -6px rgba(99,102,241,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <BarChart3 size={26} className="text-white" />
              </div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: "#6366F1", letterSpacing: "0.15em" }}>
                DataPilot
              </p>

              {/* Heading with AnimatePresence crossfade */}
              <div className="text-center min-h-[52px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={isSignup ? "signup" : "signin"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {isSignup ? "Create Account" : "Welcome Back"}
                  </motion.h2>
                </AnimatePresence>
                <p className="text-sm" style={{ color: "#71717A" }}>
                  {isSignup
                    ? "Start your analytics journey today."
                    : "Sign in to continue exploring your data."}
                </p>
              </div>
            </div>

            {/* ─── Google Button ─── */}
            <motion.button
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold mb-5 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.96)",
                color: "#1a1a1a",
                boxShadow: "0 2px 12px -2px rgba(0,0,0,0.3), 0 1px 0 0 rgba(255,255,255,0.8) inset",
                border: "1px solid rgba(255,255,255,0.9)",
              }}
              aria-label="Continue with Google"
            >
              {/* Google SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </motion.button>

            {/* ─── Divider ─── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "rgba(63,63,70,0.5)" }} />
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#52525B" }}>
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(63,63,70,0.5)" }} />
            </div>

            {/* ─── Form ─── */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Email */}
              <FloatingInput
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                onBlur={validateEmail}
                icon={Mail}
                error={emailError}
                autoComplete="email"
              />

              {/* Password */}
              <FloatingInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                autoComplete={isSignup ? "new-password" : "current-password"}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150"
                    style={{ color: "#52525B" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Remember Me + Forgot Password */}
              <AnimatePresence>
                {!isSignup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between pt-1"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div
                          className="w-4 h-4 rounded transition-all duration-150 flex items-center justify-center"
                          style={{
                            background: rememberMe
                              ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                              : "rgba(24,24,27,0.8)",
                            border: rememberMe
                              ? "1px solid #6366F1"
                              : "1px solid rgba(63,63,70,0.7)",
                          }}
                        >
                          {rememberMe && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#71717A" }}>
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold transition-colors duration-150"
                      style={{ color: "#818CF8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#A5B4FC")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#818CF8")}
                    >
                      Forgot password?
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth error / success message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
                    style={{
                      background: error.includes("Check your email")
                        ? "rgba(34,197,94,0.08)"
                        : "rgba(239,68,68,0.08)",
                      border: `1px solid ${
                        error.includes("Check your email")
                          ? "rgba(34,197,94,0.2)"
                          : "rgba(239,68,68,0.2)"
                      }`,
                    }}
                    role="alert"
                    aria-live="polite"
                  >
                    {error.includes("Check your email") ? (
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                    ) : (
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
                    )}
                    <p
                      className="text-xs font-medium leading-relaxed"
                      style={{
                        color: error.includes("Check your email") ? "#4ADE80" : "#F87171",
                      }}
                    >
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Submit Button ─── */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.015, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200"
                style={{
                  background: loading
                    ? "rgba(99,102,241,0.5)"
                    : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                  boxShadow: loading
                    ? "none"
                    : "0 0 24px -6px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                }}
                aria-disabled={loading}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={16} className="animate-spin" />
                      {isSignup ? "Creating account…" : "Signing in…"}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      {isSignup ? "Create Account" : "Sign In"}
                      <ArrowRight size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* ─── Toggle Sign In / Sign Up ─── */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <span className="text-sm" style={{ color: "#52525B" }}>
                {isSignup ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button
                onClick={switchMode}
                className="text-sm font-semibold transition-colors duration-150"
                style={{ color: "#818CF8" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#A5B4FC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#818CF8")}
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </div>

            {/* ─── Footer ─── */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(63,63,70,0.3)" }}>
              {/* Encrypted badge */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  <Shield size={11} style={{ color: "#22C55E" }} />
                  <span className="text-xs font-medium" style={{ color: "#4ADE80" }}>
                    Your data is securely encrypted
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {["Privacy Policy", "Terms of Service"].map((link) => (
                  <button
                    key={link}
                    className="text-xs transition-colors duration-150"
                    style={{ color: "#52525B" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#A1A1AA")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#52525B")}
                  >
                    {link}
                  </button>
                ))}
                <span style={{ color: "#3F3F46" }} className="text-xs">·</span>
                <span className="text-xs" style={{ color: "#3F3F46" }}>
                  v1.0.0 · Powered by AI
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}