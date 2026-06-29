/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          bg: "#09090B",
          card: "#18181B",
          primary: "#6366F1",
          accent: "#22C55E",
          secondary: "#06B6D4",
          danger: "#EF4444",
          warning: "#F59E0B",
        },
        surface: {
          DEFAULT: "#09090B",
          raised: "#18181B",
          overlay: "#1C1C1F",
          elevated: "#27272A",
        },
        border: {
          DEFAULT: "#3F3F46",
          subtle: "#27272A",
          muted: "#2C2C30",
        },
        content: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1AA",
          subtle: "#71717A",
          dim: "#52525B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(99, 102, 241, 0.5)",
        "glow-sm": "0 0 20px -5px rgba(99, 102, 241, 0.4)",
        "glow-green": "0 0 30px -8px rgba(34, 197, 94, 0.4)",
        "glow-cyan": "0 0 30px -8px rgba(6, 182, 212, 0.4)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.6), 0 1px 0 0 rgba(255,255,255,0.04) inset",
        "card-hover": "0 8px 40px -8px rgba(0, 0, 0, 0.7), 0 1px 0 0 rgba(255,255,255,0.06) inset",
        "card-glow": "0 0 0 1px rgba(99, 102, 241, 0.2), 0 8px 32px -8px rgba(99, 102, 241, 0.3)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        navbar: "0 1px 0 0 rgba(255,255,255,0.04), 0 4px 20px -4px rgba(0,0,0,0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in-down": "fadeInDown 0.4s ease-out forwards",
        "slide-in-left": "slideInLeft 0.3s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "border-flow": "borderFlow 3s linear infinite",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "number-up": "numberUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(0.97)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px -5px rgba(99,102,241,0.4)" },
          "50%": { boxShadow: "0 0 40px -5px rgba(99,102,241,0.7)" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        numberUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
        "hero-gradient": "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, rgba(6,182,212,0.05) 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
      },
    },
  },
  plugins: [],
};
