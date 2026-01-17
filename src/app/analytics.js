// yyyy-mm helper
function monthKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7); // "2026-01"
}

export function getMonthlyRevenue(jobs, monthsBack = 6) {
  const now = new Date();
  const map = new Map();

  // inicializa meses vazios
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    map.set(key, 0);
  }

  jobs.forEach((job) => {
    if (!job.paid || !job.dueDate) return;
    const key = monthKey(job.dueDate);
    if (map.has(key)) {
      map.set(key, map.get(key) + Number(job.value || 0));
    }
  });

  return Array.from(map.entries()).map(([key, total]) => ({
    month: key,
    total,
  }));
}

export function formatMonthLabel(ym) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("pt-BR", { month: "short", year: "numeric" });
}

export function getRevenueByClient(jobs, clients) {
  const map = new Map();

  // inicia todos os clientes com 0
  clients.forEach((c) => {
    map.set(c.id, {
      clientId: c.id,
      name: c.name,
      total: 0,
      jobs: 0,
    });
  });

  jobs.forEach((job) => {
    if (!job.paid) return;
    const entry = map.get(job.clientId);
    if (!entry) return;

    entry.total += Number(job.value || 0);
    entry.jobs += 1;
  });

  return Array.from(map.values())
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

function startOfWeek(date) {
  // Semana começando na segunda (pt-BR)
  const d = new Date(date);
  const day = d.getDay(); // 0 dom .. 6 sab
  const diff = (day === 0 ? -6 : 1) - day; // move para segunda
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtWeekLabel(date) {
  // "15 Jan"
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function getWeeklyCashflowForecast(jobs, weeksAhead = 8) {
  const now = new Date();
  const week0 = startOfWeek(now);

  // cria buckets semanais
  const weeks = [];
  for (let i = 0; i < weeksAhead; i++) {
    const start = addDays(week0, i * 7);
    const end = addDays(start, 7); // exclusivo
    weeks.push({
      start,
      end,
      label: fmtWeekLabel(start),
      amount: 0,
    });
  }

  // soma jobs pendentes por semana (pelo dueDate)
  jobs.forEach((j) => {
    if (j.paid) return;
    if (!j.dueDate) return;
    const due = new Date(`${j.dueDate}T00:00:00`);
    for (const w of weeks) {
      if (due >= w.start && due < w.end) {
        w.amount += Number(j.value || 0);
        break;
      }
    }
  });

  // monta série com cumulativo
  let cum = 0;
  return weeks.map((w) => {
    cum += w.amount;
    return {
      week: w.label,
      amount: w.amount,
      cumulative: cum,
    };
  });
}

export function getMonthlyCashflowForecast(jobs, monthsAhead = 6) {
  const now = new Date();
  const map = new Map();

  // inicializa meses
  for (let i = 0; i < monthsAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = d.toISOString().slice(0, 7); // yyyy-mm
    map.set(key, {
      month: key,
      amount: 0,
    });
  }

  jobs.forEach((j) => {
    if (j.paid || !j.dueDate) return;
    const key = j.dueDate.slice(0, 7);
    if (map.has(key)) {
      map.get(key).amount += Number(j.value || 0);
    }
  });

  let cumulative = 0;
  return Array.from(map.values()).map((m) => {
    cumulative += m.amount;
    return {
      month: m.month,
      amount: m.amount,
      cumulative,
    };
  });
}

export function formatMonthShort(ym) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("pt-BR", { month: "short" });
}
