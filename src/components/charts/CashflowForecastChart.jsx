import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import styled, { useTheme } from "styled-components";
import { Card, CardTitle, Row, Pill, Button } from "../ui";
import {
  getWeeklyCashflowForecast,
  getMonthlyCashflowForecast,
  formatMonthShort,
} from "../../app/analytics";
import { CalendarRange } from "lucide-react";
import { useEffect, useState } from "react";

export default function CashflowForecastChart({ jobs, defaultMode = "weekly", currency = "BRL" }) {
  const theme = useTheme();
  const [mode, setMode] = useState(defaultMode); // weekly | monthly

  // se o usuário alterar o padrão nas configurações
  useEffect(() => {
    if (defaultMode === "weekly" || defaultMode === "monthly") {
      setMode(defaultMode);
    }
  }, [defaultMode]);

  const data =
    mode === "weekly"
      ? getWeeklyCashflowForecast(jobs, 8)
      : getMonthlyCashflowForecast(jobs, 6);

  const totalNext = data.reduce((acc, x) => acc + (x.amount || 0), 0);
  if (totalNext === 0) return null;

  const main = theme.colors.accent;
  const soft = theme.colors.accentSoft;

  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>
            <CalendarRange size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Fluxo de caixa (previsão)</div>
            <CardTitle>
              {mode === "weekly"
                ? "Próximas 8 semanas • jobs pendentes"
                : "Próximos 6 meses • jobs pendentes"}
            </CardTitle>
          </div>
        </Row>

        <Row>
          <Button
            onClick={() => setMode("weekly")}
            $variant={mode === "weekly" ? "primary" : undefined}
          >
            Semanal
          </Button>
          <Button
            onClick={() => setMode("monthly")}
            $variant={mode === "monthly" ? "primary" : undefined}
          >
            Mensal
          </Button>
        </Row>
      </Row>

      <ChartWrap>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <XAxis
              dataKey={mode === "weekly" ? "week" : "month"}
              tickFormatter={mode === "weekly" ? undefined : formatMonthShort}
              stroke={theme.colors.muted}
            />
            <YAxis
              stroke={theme.colors.muted}
              tickFormatter={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0,
                })
              }
            />
            <Tooltip
              formatter={(v, name) => [
                Number(v).toLocaleString("pt-BR", {
                  style: "currency",
                  currency,
                }),
                name === "amount" ? "Período" : "Acumulado",
              ]}
              labelFormatter={(label) => label}
              contentStyle={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
              }}
            />
            <Bar dataKey="amount" fill={soft} radius={[10, 10, 0, 0]} />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke={main}
              strokeWidth={3}
              dot={{ r: 3, fill: main, stroke: main }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrap>

      <Footer>
        <Pill>
          {totalNext.toLocaleString("pt-BR", {
            style: "currency",
            currency,
          })}{" "}
          previstos
        </Pill>
        <Legend>Barras = entrada no período • Linha = acumulado</Legend>
      </Footer>
    </Card>
  );
}

const ChartWrap = styled.div`
  margin-top: 16px;
`;

const Icon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
`;

const Footer = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Legend = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;
