import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styled, { useTheme } from "styled-components";
import { Card, CardTitle, Row, Pill } from "../ui";
import { getRevenueByClient } from "../../app/analytics";
import { Users } from "lucide-react";

export default function ClientsRevenueBarChart({ jobs, clients }) {
  const theme = useTheme();
  const data = getRevenueByClient(jobs, clients);

  if (!data.length) return null;

  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>
            <Users size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Ranking de clientes</div>
            <CardTitle>Faturamento total (jobs pagos)</CardTitle>
          </div>
        </Row>

        <Pill>{data.length} clientes</Pill>
      </Row>

      <ChartWrap>
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 60)}>
          <BarChart data={data} layout="vertical">
            <XAxis
              type="number"
              stroke={theme.colors.muted}
              tickFormatter={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              stroke={theme.colors.muted}
            />
            <Tooltip
              formatter={(v, _, ctx) => [
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }),
                "Total",
              ]}
              labelFormatter={(label) => label}
              contentStyle={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
              }}
            />
            <Bar dataKey="total" radius={[0, 8, 8, 0]} fill={theme.colors.accent} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrap>

      <Legend>Quanto mais larga a barra, maior o faturamento total do cliente.</Legend>
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

const Legend = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;
