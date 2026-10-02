/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Design tokens ─────────────────────────────────────────────
        // Values live in src/index.css as CSS variables (light on :root,
        // dark on .dark), so every class below works in both themes.
        canvas: "rgb(var(--canvas) / <alpha-value>)",   // page background
        panel: "rgb(var(--panel) / <alpha-value>)",     // cards, sidebar, top bar
        sunken: "rgb(var(--sunken) / <alpha-value>)",   // hover fills, table headers, code
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",        // card / divider borders
          strong: "rgb(var(--line-strong) / <alpha-value>)",  // input borders (>= 3:1)
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          subtle: "rgb(var(--fg-subtle) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",       // buttons, focus, selection
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          text: "rgb(var(--accent-text) / <alpha-value>)",     // links, active icons
        },
        positive: "rgb(var(--positive) / <alpha-value>)",
        negative: "rgb(var(--negative) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", "16px"], // section labels, table meta
      },
      // Radius: use Tailwind's defaults — rounded-md (6px) for controls,
      // rounded-lg (8px) for cards and popovers. Nothing larger.
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",                                       // cards
        popover: "0 4px 16px -2px rgb(0 0 0 / 0.12), 0 1px 3px 0 rgb(0 0 0 / 0.06)", // menus, drawers
      },
    },
  },
  plugins: [],
};
