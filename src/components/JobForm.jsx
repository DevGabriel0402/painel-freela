import { useEffect, useState } from "react";
import { Card, Grid, Input, Select, Button, Row } from "./ui";
import { PlusCircle } from "lucide-react";

export default function JobForm({ clients, onAdd }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("andamento");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("");

  // se os clientes mudarem (ex.: primeiro cliente foi criado), seta default
  useEffect(() => {
    if (!clients.length) {
      setClientId("");
      return;
    }

    // se o clientId atual não existe mais, escolhe o primeiro
    const stillExists = clients.some((c) => c.id === clientId);
    if (!clientId || !stillExists) setClientId(clients[0].id);
  }, [clients, clientId]);

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    onAdd({
      clientId,
      title: title.trim(),
      status,
      value: Number(value || 0),
      dueDate,
      paid: false,
    });

    setTitle("");
    setStatus("andamento");
    setValue("");
    setDueDate("");
  }

  return (
    <Card as="form" onSubmit={submit}>
      <Grid $cols="1fr 1.3fr 0.9fr" $colsMobile="1fr">
        <Select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          disabled={!clients.length}
        >
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
          disabled={!clients.length}
        />

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={!clients.length}
        >
          <option value="andamento">Em andamento</option>
          <option value="entregue">Entregue</option>
          <option value="pausado">Pausado</option>
        </Select>
      </Grid>

      <Grid $cols="1fr 1fr 0.9fr" $colsMobile="1fr" style={{ marginTop: 10 }}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor (ex: 500)"
          inputMode="numeric"
          disabled={!clients.length}
        />
        <Input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          disabled={!clients.length}
        />
        <Row $between>
          <Button $variant="primary" type="submit" disabled={!clients.length}>
            <PlusCircle size={18} /> Adicionar
          </Button>
        </Row>
      </Grid>

      {!clients.length ? (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
          Cadastre pelo menos 1 cliente para criar jobs.
        </div>
      ) : null}
    </Card>
  );
}
