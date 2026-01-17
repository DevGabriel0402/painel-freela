import { useMemo, useState } from "react";
import { Card, CardTitle, CardValue, Grid, Row, Stack, Select, Pill, Button } from "./ui";
import { CalendarDays, TrendingUp, TrendingDown, ListChecks } from "lucide-react";
import { formatBRL, formatDateBR } from "../app/utils";
import styled from "styled-components";

import { downloadCSV } from "../app/exportCsv";
import { printReportAsPDF } from "../app/exportPdf";

function monthOptions() {
  const now = new Date();
  const list = [];
  // últimos 12 meses (inclui o atual)
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    list.push({
      value: `${y}-${m}`,
      label: d.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
    });
  }
  return list;
}

function getMonthRange(ym) {
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1); // exclusivo
  return { start, end };
}

function inMonth(dateStr, ym) {
  if (!dateStr) return false;
  const { start, end } = getMonthRange(ym);
  const d = new Date(`${dateStr}T00:00:00`);
  return d >= start && d < end;
}

export default function MonthlyReport({ jobs, clients }) {
  const options = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(options[0]?.value || "");

  const clientById = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  const jobsDoMes = useMemo(() => {
    if (!month) return [];
    return jobs
      .filter((j) => inMonth(j.dueDate, month))
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  }, [jobs, month]);

  const rankingClientes = useMemo(() => {
    const map = new Map(); // clientId -> { name, total, jobs }
    for (const j of jobsDoMes) {
      const name = clientById.get(j.clientId)?.name || "—";
      const cur = map.get(j.clientId) || { name, total: 0, jobs: 0 };
      cur.total += Number(j.value || 0);
      cur.jobs += 1;
      map.set(j.clientId, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [jobsDoMes, clientById]);

  const statusTotals = useMemo(() => {
    const map = { andamento: 0, entregue: 0, pausado: 0 };
    for (const j of jobsDoMes) {
      const key = j.status || "andamento";
      map[key] = (map[key] || 0) + Number(j.value || 0);
    }
    return map;
  }, [jobsDoMes]);

  const recebido = useMemo(() => {
    return jobsDoMes
      .filter((j) => j.paid)
      .reduce((acc, j) => acc + Number(j.value || 0), 0);
  }, [jobsDoMes]);

  const aReceber = useMemo(() => {
    return jobsDoMes
      .filter((j) => !j.paid)
      .reduce((acc, j) => acc + Number(j.value || 0), 0);
  }, [jobsDoMes]);

  const countPago = useMemo(() => jobsDoMes.filter((j) => j.paid).length, [jobsDoMes]);
  const countPendente = useMemo(() => jobsDoMes.filter((j) => !j.paid).length, [jobsDoMes]);

  function money(v) {
    return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function exportCSV() {
    const filename = `relatorio-${month}.csv`;

    const rows = [
      ["Mes", month],
      ["Recebido", money(recebido)],
      ["A Receber", money(aReceber)],
      [],
      ["Cliente", "Titulo", "Status", "Valor", "Vencimento", "Pago"],
      ...jobsDoMes.map((j) => [
        clientById.get(j.clientId)?.name || "—",
        j.title || "",
        j.status || "",
        money(j.value),
        j.dueDate ? formatDateBR(j.dueDate) : "",
        j.paid ? "Sim" : "Nao",
      ]),
    ];

    downloadCSV(filename, rows);
  }

  function exportPDF() {
    const title = `Relatorio - ${month}`;
    const subtitle = `Gerado em ${new Date().toLocaleString("pt-BR")}`;

    printReportAsPDF({
      title,
      subtitle,
      summaryRows: [
        ["Recebido", money(recebido)],
        ["A receber", money(aReceber)],
        ["Jobs pagos", String(countPago)],
        ["Jobs pendentes", String(countPendente)],
      ],
      sections: [
        {
          title: "Totais por status (do mes)",
          headers: ["Status", "Total"],
          rows: [
            ["andamento", money(statusTotals.andamento || 0)],
            ["entregue", money(statusTotals.entregue || 0)],
            ["pausado", money(statusTotals.pausado || 0)],
          ],
        },
        {
          title: "Ranking por cliente (do mes)",
          headers: ["Cliente", "Jobs", "Total"],
          rows: rankingClientes.map((c) => [c.name, String(c.jobs), money(c.total)]),
        },
        {
          title: "Jobs do mes (detalhado)",
          headers: ["Cliente", "Titulo", "Status", "Valor", "Vencimento", "Pago"],
          rows: jobsDoMes.map((j) => [
            clientById.get(j.clientId)?.name || "—",
            j.title || "",
            j.status || "",
            money(j.value),
            j.dueDate ? formatDateBR(j.dueDate) : "",
            j.paid ? "Sim" : "Nao",
          ]),
        },
      ],
    });
  }

  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>
            <CalendarDays size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Relatório do mês</div>
            <CardTitle>Somatório por vencimento (dueDate)</CardTitle>
          </div>
        </Row>

        <Row>
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ maxWidth: 260 }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Button type="button" onClick={exportCSV}>
            Exportar CSV
          </Button>

          <Button type="button" onClick={exportPDF}>
            Salvar PDF
          </Button>
        </Row>
      </Row>

      <Grid $cols="1fr 1fr 1.2fr" $colsMobile="1fr" style={{ marginTop: 12 }}>
        <Kpi
          icon={<TrendingUp size={18} />}
          title="Recebido no mês"
          value={formatBRL(recebido)}
          pill={`${countPago} pago(s)`}
        />
        <Kpi
          icon={<TrendingDown size={18} />}
          title="A receber no mês"
          value={formatBRL(aReceber)}
          pill={`${countPendente} pendente(s)`}
        />
        <Card>
          <Row $between>
            <Row>
              <Icon>
                <ListChecks size={18} />
              </Icon>
              <CardTitle>Jobs do mês</CardTitle>
            </Row>
            <Pill>{jobsDoMes.length} total</Pill>
          </Row>

          <DividerLine />

          {jobsDoMes.length === 0 ? (
            <Muted>Nenhum job com vencimento neste mês.</Muted>
          ) : (
            <Stack $gap="10px">
              {jobsDoMes.slice(0, 8).map((j) => (
                <Row key={j.id} $between>
                  <div style={{ minWidth: 0 }}>
                    <Ellipsis style={{ fontWeight: 800 }}>{j.title}</Ellipsis>
                    <Small data-sensitive="true">
                      {clientById.get(j.clientId)?.name || "—"} • Venc:{" "}
                      {formatDateBR(j.dueDate)} • {formatBRL(j.value)}
                    </Small>
                  </div>
                  <Pill>{j.paid ? "pago" : "pendente"}</Pill>
                </Row>
              ))}

              {jobsDoMes.length > 8 ? (
                <Muted>
                  + {jobsDoMes.length - 8} job(s) (use a lista abaixo pra ver todos)
                </Muted>
              ) : null}
            </Stack>
          )}
        </Card>
      </Grid>
    </Card>
  );
}

function Kpi({ icon, title, value, pill }) {
  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>{icon}</Icon>
          <CardTitle>{title}</CardTitle>
        </Row>
        <Pill>{pill}</Pill>
      </Row>
      <CardValue data-sensitive="true">{value}</CardValue>
    </Card>
  );
}

const Icon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
`;

const DividerLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 12px 0;
`;

const Small = styled.div`
  margin-top: 3px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Muted = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Ellipsis = styled.div`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
