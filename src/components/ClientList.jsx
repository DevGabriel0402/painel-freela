import { useMemo, useState } from "react";
import { formatBRL, formatDateBR, getInitials } from "../app/utils"; // Importa getInitials
import { Card, Input, Row, Stack, Button, Pill, Textarea, Grid } from "./ui";
import { Search, Trash2, User, Pencil } from "lucide-react";
import styled from "styled-components";
import Modal from "./Modal";

export default function ClientList({ clients, onRemove, onUpdate }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // client
  const [deleteTarget, setDeleteTarget] = useState(null); // client to delete

  // ... (rest of logic same)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) =>
      [c.name, c.contact, c.notes].some((x) => (x || "").toLowerCase().includes(s)),
    );
  }, [q, clients]);

  function openEdit(client) {
    setEditing(client);
  }

  function closeEdit() {
    setEditing(null);
  }

  function saveEdit(patch) {
    onUpdate?.(editing.id, patch);
    closeEdit();
  }

  function confirmDelete() {
    if (deleteTarget) {
      onRemove(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  return (
    <Stack>
      <SearchWrap>
        <Search size={18} />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente..."
          style={{ paddingLeft: 40 }}
        />
      </SearchWrap>

      {filtered.length === 0 ? (
        <Card>
          <Muted>Nenhum cliente encontrado.</Muted>
        </Card>
      ) : (
        filtered.map((c) => (
          <Card key={c.id}>
            <Row $between $wrap="true">
              <Row style={{ flex: 1, minWidth: "200px" }}>
                <Avatar>
                  {getInitials(c.name)}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 850 }} data-sensitive="true">
                    {c.name}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75 }} data-sensitive="true">
                    {c.contact || "-"}
                  </div>
                </div>
              </Row>

              <Row style={{ marginTop: 4 }}>
                <Pill>cliente</Pill>

                <Button type="button" onClick={() => openEdit(c)} title="Editar">
                  <Pencil size={18} />
                </Button>

                <Button $variant="danger" onClick={() => setDeleteTarget(c)} title="Remover" type="button">
                  <Trash2 size={18} />
                </Button>
              </Row>
            </Row>

            {c.notes ? <Notes data-sensitive="true">{c.notes}</Notes> : null}
          </Card>
        ))
      )}

      {/* Modals... */}
      <Modal
        open={!!editing}
        title="Editar cliente"
        subtitle={editing ? `ID: ${editing.id}` : ""}
        onClose={closeEdit}
      >
        {editing ? (
          <EditClientForm client={editing} onCancel={closeEdit} onSave={saveEdit} />
        ) : null}
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Remover cliente"
        onClose={() => setDeleteTarget(null)}
      >
        <div style={{ margin: "10px 0 20px 0" }}>
          Tem certeza que deseja remover <b>{deleteTarget?.name}</b>? Essa ação não pode ser desfeita.
        </div>
        <Row style={{ justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button $variant="danger" onClick={confirmDelete}>
            Sim, remover
          </Button>
        </Row>
      </Modal>
    </Stack>
  );
}

// ... EditClientForm same ...

function EditClientForm({ client, onCancel, onSave }) {
  // ... same ...
  const [name, setName] = useState(client.name || "");
  const [contact, setContact] = useState(client.contact || "");
  const [notes, setNotes] = useState(client.notes || "");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      contact: contact.trim(),
      notes: notes.trim(),
      updatedAt: Date.now(),
    });
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

      <Row $between style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Alterações são salvas no LocalStorage.
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

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.sm};
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
  
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  letter-spacing: -0.5px;
`;

const Notes = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.35;
`;

const Muted = styled.div`
  color: ${({ theme }) => theme.colors.muted};
`;
