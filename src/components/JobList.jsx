import { useMemo, useState } from "react";
import { formatBRL, formatDateBR } from "../app/utils";
import { Card, Input, Select, Row, Stack, Button, Pill, Grid } from "./ui";
import { Search, Trash2, CheckCircle2, Circle, Briefcase, Pencil } from "lucide-react";
import styled from "styled-components";
import Modal from "./Modal";

export default function JobList({
  jobs,
  clients,
  onTogglePaid,
  onRemove,
  onUpdateStatus,
  onUpdateJob,
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");
  const [paid, setPaid] = useState("todos");
  const [editing, setEditing] = useState(null); // job

  const clientById = useMemo(() => {
    const map = new Map();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const clientName = (clientById.get(j.clientId)?.name || "").toLowerCase();
      const okQuery =
        !s || [j.title, clientName].some((x) => (x || "").toLowerCase().includes(s));
      const okStatus = status === "todos" || j.status === status;
      const okPaid = paid === "todos" || (paid === "pago" ? j.paid : !j.paid);
      return okQuery && okStatus && okPaid;
    });
  }, [q, status, paid, jobs, clientById]);

  function openEdit(job) {
    setEditing(job);
  }
  function closeEdit() {
    setEditing(null);
  }
  function saveEdit(patch) {
    onUpdateJob?.(editing.id, patch);
    closeEdit();
  }

  return (
    <Stack>
      <Grid $cols="1fr 0.7fr 0.7fr" $colsMobile="1fr">
        <SearchWrap>
          <Search size={18} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar job..."
            style={{ paddingLeft: 40 }}
          />
        </SearchWrap>

        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Status: todos</option>
          <option value="andamento">Em andamento</option>
          <option value="entregue">Entregue</option>
          <option value="pausado">Pausado</option>
        </Select>

        <Select value={paid} onChange={(e) => setPaid(e.target.value)}>
          <option value="todos">Pagamento: todos</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </Select>
      </Grid>

      {filtered.length === 0 ? (
        <Card>
          <Muted>Nenhum job encontrado.</Muted>
        </Card>
      ) : (
        filtered.map((j) => {
          const clientName = clientById.get(j.clientId)?.name || "—";
          return (
            <Card key={j.id}>
              <Row $between $wrap="true">
                <Row style={{ minWidth: 0 }}>
                  <JobIcon>
                    <Briefcase size={18} />
                  </JobIcon>
                  <div style={{ minWidth: 0 }}>
                    <Row $gap="8px" style={{ minWidth: 0 }}>
                      <Ellipsis style={{ fontWeight: 900 }}>{j.title}</Ellipsis>
                      <Pill>{j.status}</Pill>
                      <Pill>{j.paid ? "pago" : "pendente"}</Pill>
                    </Row>
                    <Meta data-sensitive="true">
                      Cliente: <b>{clientName}</b> • Venc: {formatDateBR(j.dueDate)} •{" "}
                      <b>{formatBRL(j.value)}</b>
                    </Meta>
                  </div>
                </Row>

                <Actions>
                  <Select
                    value={j.status}
                    onChange={(e) => onUpdateStatus(j.id, e.target.value)}
                    style={{ minWidth: 150 }}
                  >
                    <option value="andamento">andamento</option>
                    <option value="entregue">entregue</option>
                    <option value="pausado">pausado</option>
                  </Select>

                  <Button
                    type="button"
                    onClick={() => onTogglePaid(j.id)}
                    $variant={j.paid ? "primary" : undefined}
                  >
                    {j.paid ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    {j.paid ? "Pago" : "Pendente"}
                  </Button>

                  <Button type="button" onClick={() => openEdit(j)} title="Editar job">
                    <Pencil size={18} />
                  </Button>

                  <Button $variant="danger" type="button" onClick={() => onRemove(j.id)}>
                    <Trash2 size={18} />
                  </Button>
                </Actions>
              </Row>
            </Card>
          );
        })
      )}

      <Modal
        open={!!editing}
        title="Editar job"
        subtitle={editing ? `ID: ${editing.id}` : ""}
        onClose={closeEdit}
      >
        {editing ? (
          <EditJobForm
            job={editing}
            clients={clients}
            onCancel={closeEdit}
            onSave={saveEdit}
          />
        ) : null}
      </Modal>
    </Stack>
  );
}

function EditJobForm({ job, clients, onCancel, onSave }) {
  const [clientId, setClientId] = useState(job.clientId || "");
  const [title, setTitle] = useState(job.title || "");
  const [status, setStatus] = useState(job.status || "andamento");
  const [value, setValue] = useState(String(job.value ?? ""));
  const [dueDate, setDueDate] = useState(job.dueDate || "");
  const [paid, setPaid] = useState(!!job.paid);

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    onSave({
      clientId,
      title: title.trim(),
      status,
      value: Number(value || 0),
      dueDate,
      paid,
      updatedAt: Date.now(),
    });
  }

  return (
    <Card as="form" onSubmit={submit}>
      <Grid $cols="1fr 1.2fr 0.8fr" $colsMobile="1fr">
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do job"
        />

        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="andamento">Em andamento</option>
          <option value="entregue">Entregue</option>
          <option value="pausado">Pausado</option>
        </Select>
      </Grid>

      <Grid $cols="1fr 1fr 1fr" $colsMobile="1fr" style={{ marginTop: 10 }}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor (ex: 500)"
          inputMode="numeric"
        />
        <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
        <Select
          value={paid ? "pago" : "pendente"}
          onChange={(e) => setPaid(e.target.value === "pago")}
        >
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
        </Select>
      </Grid>

      <Row $between style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Você pode alterar cliente, status, valor e vencimento.
        </div>
        <Row>
          <Button type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button $variant="primary" type="submit">
            Salvar
          </Button>
        </Row>
      </Row>
    </Card>
  );
}

const SearchWrap = styled.div`
  position: relative;
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.75;
  }
`;

const JobIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  flex: 0 0 auto;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 920px) {
    margin-top: 10px;
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;

const Meta = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.colors.muted};
`;

const Ellipsis = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
