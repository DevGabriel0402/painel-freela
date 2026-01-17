import Logo from "../assets/Freela Logo.PNG";

export const defaultSettings = {
  currency: "BRL", // BRL | USD | EUR
  monthlyGoal: 10000, // meta mensal
  cashflowDefaultMode: "weekly", // weekly | monthly
  appName: "Flowyhub",
  appDescription: "Seu painel de controle para Freelas",
  accent: "#0b0b0b", // hex (ex: #ff0055)
  logoUrl: Logo, // url de imagem para logo (opcional)
  mode: "dark", // dark | light
};

export function mergeSettings(stored) {
  // garante compatibilidade quando você adicionar novas opções no futuro
  if (!stored || typeof stored !== "object") return { ...defaultSettings };
  return { ...defaultSettings, ...stored };
}

export function clampHex(hex) {
  if (!hex) return defaultSettings.accent;
  const h = String(hex).trim();
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h : defaultSettings.accent;
}
