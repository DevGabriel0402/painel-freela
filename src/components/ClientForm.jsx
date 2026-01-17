import { useState } from "react";
import { Card, Grid, Input, Textarea, Button, Row } from "./ui";
import { UserPlus } from "lucide-react";
import Modal from "./Modal";

export default function ClientForm({ onAdd }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedName, setAddedName] = useState("");

  function handleContactChange(e) {
    let v = e.target.value;
    v = v.replace(/\D/g, ""); // Remove não-números
    if (v.length > 11) v = v.slice(0, 11); // Limita tamanho

    // Máscara de Celular: (XX) XXXXX-XXXX
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");

    setContact(v);
  }

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const clientName = name.trim();
    onAdd({ name: clientName, contact: contact.trim(), notes: notes.trim() });

    setAddedName(clientName);
    setShowSuccess(true);

    setName("");
    setContact("");
    setNotes("");
  }

  return (
    <>
      <Card as="form" onSubmit={submit}>
        <Grid $cols="1fr 1fr" $colsMobile="1fr">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cliente"
          />
          <Input
            value={contact}
            onChange={handleContactChange}
            placeholder="WhatsApp (ex: (31) 98765-4321)"
            maxLength={15}
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

      <Modal
        open={showSuccess}
        title="Cliente Adicionado"
        onClose={() => setShowSuccess(false)}
      >
        <div style={{ margin: "10px 0 20px 0" }}>
          O cliente <b>{addedName}</b> foi cadastrado com sucesso!
        </div>
        <Row style={{ justifyContent: "flex-end" }}>
          <Button $variant="primary" onClick={() => setShowSuccess(false)}>
            Continuar
          </Button>
        </Row>
      </Modal>
    </>
  );
}
