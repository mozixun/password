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
          hover: "rgb(var(--vault-hover))",
          glass: "rgb(var(--vault-glass))",
          "glass-border": "rgb(var(--vault-glass-border))",
          accent: "rgb(var(--vault-accent))",
          "accent-hover": "rgb(var(--vault-accent-hover))",
          "accent-dim": "rgb(var(--vault-accent-dim))",
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
        display: ["Plus Jakarta Sans", "SF Pro Display", "system-ui", "sans-serif"],
        body: ["DM Sans", "SF Pro Text", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-subtle": "bounceSubtle 0.5s ease-in-out",
        "glass-expand": "glassExpand 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "spring-bounce": "springBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "glow-flow": "glowFlow 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(167, 139, 250, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(167, 139, 250, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        glassExpand: {
          "0%": { opacity: "0", transform: "scale(0.95)", filter: "blur(8px)" },
          "100%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        springBounce: {
          "0%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        glowFlow: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
