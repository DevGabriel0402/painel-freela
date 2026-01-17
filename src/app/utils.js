export function formatBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateBR(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const target = new Date(`${dateStr}T00:00:00`);
  const diff = target.getTime() - new Date(today.toDateString()).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
