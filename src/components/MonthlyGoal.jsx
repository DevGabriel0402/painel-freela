import { useMemo } from "react";
import styled from "styled-components";
import { Card, CardTitle, Row, Pill } from "./ui";
import { Target } from "lucide-react";

function monthKey(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7);
}

function formatMoney(v, currency) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  });
}

export default function MonthlyGoal({ jobs, settings }) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const receivedThisMonth = useMemo(() => {
    return jobs
      .filter((j) => j.paid && monthKey(j.dueDate) === currentMonth)
      .reduce((acc, j) => acc + Number(j.value || 0), 0);
  }, [jobs, currentMonth]);

  const goal = Number(settings?.monthlyGoal || 0);
  const pct = goal > 0 ? Math.min(100, Math.round((receivedThisMonth / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - receivedThisMonth);

  return (
    <Card>
      <Row $between>
        <Row>
          <Icon>
            <Target size={18} />
          </Icon>
          <div>
            <div style={{ fontWeight: 900 }}>Meta do mês</div>
            <CardTitle>{currentMonth} • baseado em jobs pagos</CardTitle>
          </div>
        </Row>

        <Pill>{pct}%</Pill>
      </Row>

      <Numbers>
        <div>
          <Small>Recebido</Small>
          <Big data-sensitive="true">{formatMoney(receivedThisMonth, settings.currency)}</Big>
        </div>

        <div style={{ textAlign: "right" }}>
          <Small>Meta</Small>
          <Big data-sensitive="true">{formatMoney(goal, settings.currency)}</Big>
        </div>
      </Numbers>

      <Bar>
        <Fill style={{ width: `${pct}%` }} />
      </Bar>

      <Hint>
        {goal <= 0
          ? "Defina uma meta nas configurações."
          : remaining === 0
            ? "Meta batida 🎉"
            : (
                <>
                  Faltam <span data-sensitive="true">{formatMoney(remaining, settings.currency)}</span> para bater a meta.
                </>
              )}
      </Hint>
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

const Numbers = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
`;

const Small = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Big = styled.div`
  margin-top: 4px;
  font-weight: 950;
  font-size: 18px;
`;

const Bar = styled.div`
  margin-top: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 999px;
  transition: width 0.2s ease;
`;

const Hint = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;
