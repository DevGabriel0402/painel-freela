import { formatBRL, daysUntil } from "../app/utils";
import { Card, CardTitle, CardValue, Row, Stack, Pill } from "./ui";
import { CalendarClock, Wallet, Banknote } from "lucide-react";
import styled from "styled-components";

export default function Dashboard({ jobs }) {
  const totalReceber = jobs
    .filter((j) => !j.paid)
    .reduce((acc, j) => acc + Number(j.value || 0), 0);

  const totalRecebido = jobs
    .filter((j) => j.paid)
    .reduce((acc, j) => acc + Number(j.value || 0), 0);

  const proximos = [...jobs]
    .filter((j) => !j.paid && j.dueDate)
    .map((j) => ({ ...j, d: daysUntil(j.dueDate) }))
    .sort((a, b) => (a.d ?? 9999) - (b.d ?? 9999))
    .slice(0, 3);

  return (
    <DashGrid>
      <Kpi
        icon={<Wallet size={18} />}
        title="A receber"
        value={formatBRL(totalReceber)}
      />
      <Kpi
        icon={<Banknote size={18} />}
        title="Recebido"
        value={formatBRL(totalRecebido)}
      />

      <Card>
        <Row $between>
          <Row>
            <IconWrap>
              <CalendarClock size={18} />
            </IconWrap>
            <CardTitle>Próximos vencimentos</CardTitle>
          </Row>
          <Pill>top 3</Pill>
        </Row>

        <Stack $gap="8px" style={{ marginTop: 10 }}>
          {proximos.length === 0 ? (
            <Empty>Sem vencimentos pendentes 👌</Empty>
          ) : (
            proximos.map((j) => (
              <Row key={j.id} $between>
                <Ellipsis>{j.title}</Ellipsis>
                <Pill>{j.d === 0 ? "hoje" : j.d === 1 ? "amanhã" : `${j.d}d`}</Pill>
              </Row>
            ))
          )}
        </Stack>
      </Card>
    </DashGrid>
  );
}

function Kpi({ icon, title, value }) {
  return (
    <Card>
      <Row $between>
        <Row>
          <IconWrap>{icon}</IconWrap>
          <CardTitle>{title}</CardTitle>
        </Row>
        <Pill>BRL</Pill>
      </Row>
      <CardValue>{value}</CardValue>
    </Card>
  );
}

const DashGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1.2fr;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const IconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(4, 4, 4, 0.14);
  background: rgba(4, 4, 4, 0.12);
`;

const Empty = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Ellipsis = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
