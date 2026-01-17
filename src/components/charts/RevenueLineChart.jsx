import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styled, { useTheme } from "styled-components";
import { Card, CardTitle, Row } from "../ui";
import { getMonthlyRevenue, formatMonthLabel } from "../../app/analytics";
import { TrendingUp } from "lucide-react";

export default function RevenueLineChart({ jobs }) {
  const theme = useTheme();
  const data = getMonthlyRevenue(jobs, 6);

  return (
    <Card>
      <Row>
        <Icon>
          <TrendingUp size={18} />
        </Icon>
        <div>
          <div style={{ fontWeight: 900 }}>Faturamento mensal</div>
          <CardTitle>Últimos 6 meses (jobs pagos)</CardTitle>
        </div>
      </Row>

      <ChartWrap>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonthLabel}
              stroke={theme.colors.muted}
            />
            <YAxis
              stroke={theme.colors.muted}
              tickFormatter={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              }
            />
            <Tooltip
              formatter={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
              labelFormatter={formatMonthLabel}
              contentStyle={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={theme.colors.accent}
              strokeWidth={3}
              dot={{ r: 4, fill: theme.colors.accent, stroke: theme.colors.accent }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrap>
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
