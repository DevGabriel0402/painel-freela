const FLUXUS_PATH =
  "M14.348 19.35a2738.241 2738.241 0 0 0-3.926-5.741 595.98 595.98 0 0 1-1.5-2.194 433.452 433.452 0 0 0-1.646-2.396c-.493-.712-.88-1.343-.86-1.404.021-.06.944-.73 2.05-1.489 4.797-3.285 8.82-6.032 8.962-6.117.124-.075.152.287.147 1.963l-.005 2.055-2.993 2.02c-1.647 1.111-2.975 2.072-2.953 2.136.117.326 2.53 3.694 2.645 3.694.11 0 1.55-.937 3.084-2.005.224-.156.227-.125.226 1.905v2.063l-.692.446c-.38.245-.692.49-.692.544 0 .054.313.545.694 1.09l.695.993-.03 3.543-.03 3.544z";

function ensureLink(rel, attributes = {}) {
  const selector = `link[rel='${rel}']`;
  let link = document.querySelector(selector);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      link.setAttribute(key, value);
    }
  });
  return link;
}

function encodeSvg(svg) {
  const encoded = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

function buildIconSvg({ background, accent, border }) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <defs>\n    <linearGradient id="loader-accent" x1="0%" y1="100%" x2="0%" y2="0%">\n      <stop offset="0%" stop-color="${accent}" stop-opacity="0.5" />\n      <stop offset="100%" stop-color="${accent}" stop-opacity="1" />\n    </linearGradient>\n  </defs>\n  <rect width="24" height="24" rx="6" fill="${background}" stroke="${border}" stroke-width="1" />\n  <path fill="url(#loader-accent)" d="${FLUXUS_PATH}" />\n</svg>`;
}

function contrastColor(hex) {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return "#0b0b0c";
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0b0b0c" : "#f5f5f7";
}

export function syncPwaAssets({ theme, appName }) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (!theme) return;

  const accent = theme.accent || theme.colors?.accent || "#111111";
  const background = theme.mode === "dark" ? "#f5f5f7" : "#0b0b0c";
  const border = theme.colors?.border || "rgba(0,0,0,0.1)";

  const svg = buildIconSvg({ background, accent, border });
  const iconDataUrl = encodeSvg(svg);

  // favicon + touch icon
  ensureLink("icon", { type: "image/svg+xml", href: iconDataUrl });
  ensureLink("shortcut icon", { type: "image/svg+xml", href: iconDataUrl });
  ensureLink("apple-touch-icon", { href: iconDataUrl });

  // tint status bar for Safari on iOS (requires meta)
  const meta =
    document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']") ||
    (() => {
      const created = document.createElement("meta");
      created.setAttribute("name", "apple-mobile-web-app-status-bar-style");
      document.head.appendChild(created);
      return created;
    })();
  meta.setAttribute("content", theme.mode === "dark" ? "black" : "default");

  const maskMeta =
    document.querySelector("meta[name='apple-mobile-web-app-title']") ||
    (() => {
      const created = document.createElement("meta");
      created.setAttribute("name", "apple-mobile-web-app-title");
      document.head.appendChild(created);
      return created;
    })();
  maskMeta.setAttribute("content", appName || "Flowyhub");

  const iconColorMeta =
    document.querySelector("meta[name='msapplication-TileColor']") ||
    (() => {
      const created = document.createElement("meta");
      created.setAttribute("name", "msapplication-TileColor");
      document.head.appendChild(created);
      return created;
    })();
  iconColorMeta.setAttribute("content", contrastColor(accent));
}
