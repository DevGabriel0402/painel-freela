const KEY = "painel_freela_v1";

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadState() {
  const raw = localStorage.getItem(KEY);
  return safeParse(raw, { clients: [], jobs: [] });
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
