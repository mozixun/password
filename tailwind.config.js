/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        vault: {
          bg: "rgb(var(--vault-bg))",
          surface: "rgb(var(--vault-surface))",
          card: "rgb(var(--vault-card))",
          border: "rgb(var(--vault-border))",
          "border-strong": "rgb(var(--vault-border-strong))",
          hover: "rgb(var(--vault-hover))",
          glass: "rgb(var(--vault-glass))",
          "glass-border": "rgb(var(--vault-glass-border))",
          accent: "rgb(var(--vault-accent))",
          "accent-hover": "rgb(var(--vault-accent-hover))",
          "accent-dim": "rgb(var(--vault-accent-dim))",
          "accent-fg": "rgb(var(--vault-accent-fg))",
          warn: "rgb(var(--vault-warn))",
          "warn-dim": "rgb(var(--vault-warn-dim))",
          orange: "rgb(var(--vault-orange))",
          blue: "rgb(var(--vault-blue))",
          purple: "rgb(var(--vault-purple))",
          text: "rgb(var(--vault-text))",
          "text-secondary": "rgb(var(--vault-text-secondary))",
          "text-muted": "rgb(var(--vault-text-muted))",
          success: "rgb(var(--vault-success))",
          error: "rgb(var(--vault-error))",
        },
      },
      fontFamily: {
        // Industrial Mono: JetBrains Mono everywhere, paired with no decorative face.
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', '"Menlo"', 'monospace'],
        display: ['"JetBrains Mono"', '"SFMono-Regular"', 'monospace'],
        body: ['"JetBrains Mono"', '"SFMono-Regular"', 'monospace'],
        sans: ['"JetBrains Mono"', '"SFMono-Regular"', 'monospace'],
      },
      letterSpacing: {
        'mono-tight': '-0.01em',
        'mono-wide': '0.08em',
        'mono-caps': '0.16em',
      },
      borderRadius: {
        // Sharp industrial corners — no rounded-2xl slop.
        'none': '0px',
        'xs': '1px',
        'sm': '2px',
      },
      animation: {
        "fade-in": "fadeIn 120ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 140ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slideInLeft 140ms cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scaleIn 100ms ease-out",
        "caret-blink": "caretBlink 1.1s steps(1) infinite",
        "ticker": "ticker 600ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-4px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Terminal caret for log/empty states — the one signature motion moment.
        caretBlink: {
          "0%, 50%": { opacity: "1" },
          "50.01%, 100%": { opacity: "0" },
        },
        // Monospace number ticker for counts/scores.
        ticker: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
