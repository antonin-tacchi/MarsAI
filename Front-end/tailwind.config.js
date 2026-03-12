export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          black:     "#0A0A0F",
          dark:      "#12121A",
          charcoal:  "#1E1E2E",
          deeper:    "#0D0D14",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light:   "#E8C97A",
          pale:    "#F5E6C0",
          dark:    "#8B6914",
          shine:   "#FFD700",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          muted:   "#C8C0B0",
          faint:   "#E8E0D0",
        },
        silver: {
          DEFAULT: "#A8A9AD",
          light:   "#D4D5D8",
          dark:    "#6B6C70",
        },
        crimson: {
          DEFAULT: "#8B1A2E",
          light:   "#B02240",
        },
        // Legacy colors kept for backward compat
        beige:        "#FBF5F0",
        peach:        "#FBD5BD",
        lavender:     "#C7C2CE",
        "light-purple": "#8A83DA",
        purple:       "#463699",
        "dark-purple": "#262335",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans:    ["'Saira'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient":    "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)",
        "gold-radial":      "radial-gradient(ellipse at center, #E8C97A 0%, #C9A84C 60%, #8B6914 100%)",
        "cinema-gradient":  "linear-gradient(180deg, #0A0A0F 0%, #1E1E2E 100%)",
        "card-gradient":    "linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.95) 100%)",
        "shimmer":          "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)",
      },
      boxShadow: {
        "gold-sm":  "0 0 8px rgba(201,168,76,0.3)",
        "gold-md":  "0 0 20px rgba(201,168,76,0.25), 0 4px 16px rgba(0,0,0,0.4)",
        "gold-lg":  "0 0 40px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.6)",
        "cinema":   "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
        "card":     "0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(201,168,76,0.1)",
      },
      animation: {
        "shimmer":       "shimmer 2.5s infinite",
        "fade-in-up":    "fadeInUp 0.6s ease-out forwards",
        "fade-in":       "fadeIn 0.4s ease-out forwards",
        "glow-pulse":    "glowPulse 3s ease-in-out infinite",
        "modal-appear":  "modalAppear 0.25s ease-out",
        "slide-up":      "slideUp 0.35s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(201,168,76,0.2)" },
          "50%":       { boxShadow: "0 0 28px rgba(201,168,76,0.45)" },
        },
        modalAppear: {
          "0%":   { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      letterSpacing: {
        "widest-xl": "0.3em",
        "widest-2xl": "0.5em",
      },
    },
  },
  plugins: [],
}
