const common = {
  radius: {
    xl: "18px",
    lg: "14px",
    md: "12px",
    sm: "8px",
  },
  shadow: {
    soft: "0 4px 10px rgba(0,0,0,0.18)",
  },
};

function clampHex(hex, fallback = "#111111") {
  if (!hex) return fallback;
  const h = String(hex).trim();
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h : fallback;
}

function hexToRgb(hex) {
  const h = clampHex(hex);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return { r, g, b };
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance({ r, g, b }) {
  // sRGB -> linear
  const srgb = [r, g, b].map((v) => v / 255);
  const lin = srgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function bestTextOnAccent(accentHex) {
  const lum = relativeLuminance(hexToRgb(accentHex));
  // threshold tuned for UI buttons
  return lum > 0.55 ? "#0b0b0c" : "#ffffff";
}

export function makeTheme({ mode = "dark", accent = "#111111" } = {}) {
  const dark = mode === "dark";
  const accentHex = clampHex(accent, "#111111");

  return {
    ...common,
    mode,
    accent: accentHex,
    colors: {
      bg: dark ? "#0b0b0c" : "#f5f5f7",
      surface: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.92)",
      surface2: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.04)",
      border: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
      text: dark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.90)",
      muted: dark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.62)",

      // Accent
      accent: accentHex,
      accentSoft: rgbaFromHex(accentHex, dark ? 0.22 : 0.16),
      accentRing: rgbaFromHex(accentHex, dark ? 0.3 : 0.22),
      accentText: bestTextOnAccent(accentHex),

      danger: dark ? "rgba(255,77,109,0.95)" : "rgba(220,50,70,0.92)",
    },
  };
}

// Backwards compatibility (if anything still imports these)
export const darkTheme = makeTheme({ mode: "dark", accent: "#111111" });
export const lightTheme = makeTheme({ mode: "light", accent: "#111111" });
