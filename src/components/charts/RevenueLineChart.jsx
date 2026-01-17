import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import styled, { useTheme } from "styled-components";
import { Card, CardTitle, Row } from "../ui";
import {
  getMonthlyRevenue,
  getWeeklyRevenue,
  getDailyRevenue
} from "../../app/analytics";
import { TrendingUp } from "lucide-react";

export default function RevenueLineChart({ jobs }) {
  const theme = useTheme();
  const [range, setRange] = useState("monthly"); // monthly, weekly, daily

  const data = useMemo(() => {
    if (range === "weekly") return getWeeklyRevenue(jobs);
    if (range === "daily") return getDailyRevenue(jobs);
    return getMonthlyRevenue(jobs);
  }, [jobs, range]);

  return (
    <Card>
      <Header>
        <Row>
          <Icon>
            <TrendingUp size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Faturamento</div>
            <CardTitle>
              {range === "monthly" && "Últimos 6 meses"}
              {range === "weekly" && "Últimas 8 semanas"}
              {range === "daily" && "Últimos 14 dias"}
            </CardTitle>
          </div>
        </Row>

        <Controls>
          <FilterBtn type="button" $active={range === "daily"} onClick={() => setRange("daily")}>Dia</FilterBtn>
          <FilterBtn type="button" $active={range === "weekly"} onClick={() => setRange("weekly")}>Sem</FilterBtn>
          <FilterBtn type="button" $active={range === "monthly"} onClick={() => setRange("monthly")}>Mês</FilterBtn>
        </Controls>
      </Header>

      <ChartWrap>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.border} />
            <XAxis
              dataKey="label"
              stroke={theme.colors.muted}
              tick={{ fontSize: 12 }}
              tickMargin={10}
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
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(v) =>
                v.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
              contentStyle={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 12,
                fontSize: 12
              }}
              cursor={{ stroke: theme.colors.muted, strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={theme.colors.accent}
              strokeWidth={3}
              dot={{ r: 4, fill: theme.colors.accent, stroke: theme.colors.accent }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrap>
    </Card>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Controls = styled.div`
    display: flex;
    background: ${({ theme }) => theme.colors.surface2};
    padding: 4px;
    border-radius: 8px;
    gap: 4px;
`;

const FilterBtn = styled.button`
    border: 0;
    background: ${({ $active, theme }) => $active ? theme.colors.surface : "transparent"};
    color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.muted};
    font-weight: ${({ $active }) => $active ? 700 : 500};
    font-size: 11px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: ${({ $active, theme }) => $active ? theme.shadow.soft : "none"};
    transition: all 0.2s;
    
    &:hover {
        color: ${({ theme }) => theme.colors.text};
    }
`;

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
