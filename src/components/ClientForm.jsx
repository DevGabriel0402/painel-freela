import { useState } from "react";
import { Card, Grid, Input, Textarea, Button, Row } from "./ui";
import { UserPlus } from "lucide-react";

export default function ClientForm({ onAdd }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), contact: contact.trim(), notes: notes.trim() });
    setName("");
    setContact("");
    setNotes("");
  }

  return (
    <Card as="form" onSubmit={submit}>
      <Grid $cols="1fr 1fr" $colsMobile="1fr">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do cliente"
        />
        <Input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Contato (email/whats)"
        />
      </Grid>

      <div style={{ marginTop: 10 }}>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações"
        />
      </div>

      <Row style={{ marginTop: 10 }} $between>
        <div style={{ opacity: 0.7, fontSize: 12 }}>
          Dica: use observações pra briefing, prazos e preferências.
        </div>
        <Button $variant="primary" type="submit">
          <UserPlus size={18} /> Adicionar
        </Button>
      </Row>
    </Card>
  );
}
