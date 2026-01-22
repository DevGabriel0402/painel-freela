import { useMemo, useState, useEffect } from "react";
import { Card, CardTitle, CardValue, Grid, Row, Stack, Select, Pill, Button } from "./ui";
import { CalendarDays, TrendingUp, TrendingDown, ListChecks, FileSpreadsheet, FileText } from "lucide-react";
import { formatBRL, formatDateBR } from "../app/utils";
import styled, { useTheme } from "styled-components";

import { downloadCSV } from "../app/exportCsv";
import { printReportAsPDF } from "../app/exportPdf";
import toast from "react-hot-toast";

// ... (functions monthOptions, getMonthRange, inMonth remain the same) 
// BUT we need to make sure we don't delete them if we are replacing a chunk.
// The user prompt implies I should modify the COMPONENT RETURN.
// I will target the imports and the Component Return.

// ...

// Re-targeting to include imports and the Component return block safely.
// Since the file might be large, I'll do 2 edits if needed, or widely target if safe.
// Let's rely on flexible matching.


function monthOptions() {
  const now = new Date();
  const list = [];
  // últimos 12 meses (inclui o atual)
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");

    const label = d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

    list.push({
      value: `${y}-${m}`,
      label: capitalized,
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

export default function MonthlyReport({ jobs, clients, settings }) {
  const options = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(options[0]?.value || "");
  const theme = useTheme();

  // Let's check imports first. 'styled' is default import. 
  // 'useTheme' is a named export from styled-components.
  // I will add the import to line 5.




  async function exportPDF() {
    // Format "2026-01" to "Janeiro de 2026" for the title
    const [y, m] = month.split("-");
    const dateObj = new Date(Number(y), Number(m) - 1, 1);
    const titleFormatted = dateObj.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const titleFinal = titleFormatted.charAt(0).toUpperCase() + titleFormatted.slice(1);

    const subtitle = `${new Date().toLocaleString("pt-BR")}`;

    function formatCount(val) {
      return Number(val) === 0 ? "Nenhum" : String(val);
    }

    await printReportAsPDF({
      appName: settings?.appName,
      logoUrl: settings?.logoUrl,
      themeColor: theme?.colors?.accent,
      title: titleFinal,
      subtitle: subtitle,
      summaryRows: [
        ["Recebido", money(recebido)],
        ["A Receber", money(aReceber)],
        ["Jobs pagos", formatCount(countPago)],
        ["Jobs pendentes", formatCount(countPendente)],
      ],
      sections: [
        {
          title: "Totais por Status (do Mês)",
          headers: ["Status", "Total"],
          rows: [
            ["Em Andamento", money(statusTotals.andamento || 0)],
            ["Entregue", money(statusTotals.entregue || 0)],
            ["Pausado", money(statusTotals.pausado || 0)],
          ],
        },
        {
          title: "Ranking por cliente (do Mês)",
          headers: ["Cliente", "Jobs", "Total"],
          rows: rankingClientes.map((c) => [c.name, String(c.jobs), money(c.total)]),
        },
        {
          title: "Jobs do Mês (detalhado)",
          headers: ["Cliente", "Título", "Status", "Valor", "Vencimento", "Pago"],
          rows: jobsDoMes.map((j) => [
            clientById.get(j.clientId)?.name || "—",
            j.title || "",
            j.status || "",
            money(j.value),
            j.dueDate ? formatDateBR(j.dueDate) : "",
            j.paid ? "Sim" : "Não",
          ]),
        },
      ],
    });
    toast.success("PDF gerado com sucesso!");
  }

  const clientById = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      ["Mês", month],
      ["Recebido", money(recebido)],
      ["A Receber", money(aReceber)],
      [],
      ["Cliente", "Título", "Status", "Valor", "Vencimento", "Pago"],
      ...jobsDoMes.map((j) => [
        clientById.get(j.clientId)?.name || "—",
        j.title || "",
        j.status || "",
        money(j.value),
        j.dueDate ? formatDateBR(j.dueDate) : "",
        j.paid ? "Sim" : "Não",
      ]),
    ];

    downloadCSV(filename, rows);
    toast.success("CSV exportado com sucesso!");
  }



  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <Row>
          <Icon>
            <CalendarDays size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Relatório do Mês</div>
            <CardTitle>Somatório por Vencimento</CardTitle>
          </div>
        </Row>

        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 8,
          alignItems: isMobile ? "stretch" : "center",
          flex: isMobile ? "1 1 100%" : "0 0 auto",
          width: isMobile ? "100%" : "auto"
        }}>
          <Select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            options={options}
            placeholder="Selecione o mês"
          />

          <div style={{
            display: isMobile ? "grid" : "flex",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            width: isMobile ? "auto" : "auto"
          }}>
            <Button type="button" onClick={exportCSV} title="Exportar CSV">
              <FileSpreadsheet size={18} /> <span style={{ fontSize: 13 }}>CSV</span>
            </Button>

            <Button type="button" onClick={exportPDF} title="Salvar PDF">
              <FileText size={18} /> <span style={{ fontSize: 13 }}>PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <Grid $cols="1fr 1fr 1.2fr" $colsMobile="1fr" style={{ marginTop: 12 }}>
        <Kpi
          icon={<TrendingUp size={18} />}
          title="Recebido no Mês"
          value={formatBRL(recebido)}
          pill={`${countPago} pago(s)`}
        />
        <Kpi
          icon={<TrendingDown size={18} />}
          title="A Receber no Mês"
          value={formatBRL(aReceber)}
          pill={`${countPendente} pendente(s)`}
        />
        <Card>
          <Row $between>
            <Row>
              <Icon>
                <ListChecks size={18} />
              </Icon>
              <CardTitle>Jobs do Mês</CardTitle>
            </Row>
            <Pill>{jobsDoMes.length} total</Pill>
          </Row>

          <DividerLine />

          {jobsDoMes.length === 0 ? (
            <Muted>Nenhum job com vencimento neste mês.</Muted>
          ) : (
            <Stack $gap="10px">
              {jobsDoMes.slice(0, 8).map((j) => (
                <JobRow key={j.id}>
                  <JobInfo>
                    <Ellipsis style={{ fontWeight: 800 }}>{j.title}</Ellipsis>
                    <Small data-sensitive="true">
                      {clientById.get(j.clientId)?.name || "—"} • Venc:{" "}
                      {formatDateBR(j.dueDate)} • {formatBRL(j.value)}
                    </Small>
                  </JobInfo>
                  <Pill>{j.paid ? "Pago" : "Pendente"}</Pill>
                </JobRow>
              ))}

              {jobsDoMes.length > 8 ? (
                <Muted>
                  + {jobsDoMes.length - 8} job(s) (use a lista abaixo para ver todos)
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
  max-width: 300px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const JobRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const JobInfo = styled.div`
  min-width: 0;
  flex: 1;
  padding-right: 8px;
  max-width: 220px; /* Limit on desktop to ensure pill fits */

  @media (max-width: 400px) {
    max-width: 200px;
  }
`;
