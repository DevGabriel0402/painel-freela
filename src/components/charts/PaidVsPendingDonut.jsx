import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styled, { useTheme } from "styled-components";
import { Card, CardTitle, Row, Pill } from "../ui";
import { CheckCircle2, Clock } from "lucide-react";

export default function PaidVsPendingDonut({ jobs }) {
  const theme = useTheme();

  const paidCount = jobs.filter((j) => j.paid).length;
  const pendingCount = jobs.filter((j) => !j.paid).length;
  const total = paidCount + pendingCount;

  if (total === 0) return null;

  const data = [
    { name: "Pago", value: paidCount },
    { name: "Pendente", value: pendingCount },
  ];

  // ✅ Cores: usa o accent do sistema
  const colors = [theme.colors.accent, theme.colors.border];

  const paidPct = Math.round((paidCount / total) * 100);

  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>
            <CheckCircle2 size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Pagos vs Pendentes</div>
            <CardTitle>Distribuição de jobs</CardTitle>
          </div>
        </Row>

        <Pill>{paidPct}% pagos</Pill>
      </Row>

      <Grid>
        <ChartArea>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                stroke="transparent"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(v, name) => [`${v} job(s)`, name]}
                contentStyle={{
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <Center>
            <CenterBig>{total}</CenterBig>
            <CenterSmall>jobs</CenterSmall>
          </Center>
        </ChartArea>

        <Legend>
          <LegendItem>
            <Dot style={{ background: colors[0] }} />
            <span>Pago</span>
            <Right>
              <b>{paidCount}</b>
              <small>{Math.round((paidCount / total) * 100)}%</small>
            </Right>
          </LegendItem>

          <LegendItem>
            <Dot style={{ background: colors[1] }} />
            <span>Pendente</span>
            <Right>
              <b>{pendingCount}</b>
              <small>{Math.round((pendingCount / total) * 100)}%</small>
            </Right>
          </LegendItem>

          <HintRow>
            <HintIcon>
              <Clock size={16} />
            </HintIcon>
            <HintText>
              Dica: marque como <b>pago</b> quando cair na conta.
            </HintText>
          </HintRow>
        </Legend>
      </Grid>
    </Card>
  );
}

const Grid = styled.div`
  margin-top: 14px;
  display: grid;
  gap: 14px;
  grid-template-columns: 320px 1fr;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const ChartArea = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.colors.surface2};
  padding: 10px;
`;

const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  place-items: center;
  pointer-events: none;
  text-align: center;
`;

const CenterBig = styled.div`
  font-weight: 950;
  font-size: 28px;
  line-height: 1;
`;

const CenterSmall = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Legend = styled.div`
  display: grid;
  gap: 10px;
`;

const LegendItem = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 10px;

  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 999px;
`;

const Right = styled.div`
  display: grid;
  justify-items: end;
  gap: 2px;

  small {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const HintRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const HintIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
`;

const HintText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};

  b {
    color: ${({ theme }) => theme.colors.text};
  }
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
