import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Page, Card, CardTitle, Grid, Input, Row, Button, Pill, Divider } from "../components/ui";
import { Shield, Search, Save, UserX, UserCheck, Trash2 } from "lucide-react";
import {
  subscribeAllUsers,
  setUserPermissionsAdmin,
  setUserDisabledAdmin,
  clearUserDataAdmin,
  deleteUserFS,
  seedDataForUser
} from "../app/firestore";
import { ADMIN_EMAIL } from "../app/admin";

const DEFAULT_PERMS = {
  dashboard: true,
  jobs: true,
  clientes: true,
  settings: true,
};

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState({}); // uid -> boolean
  const [draftPerms, setDraftPerms] = useState({}); // uid -> perms

  useEffect(() => {
    const unsub = subscribeAllUsers(setUsers);
    return () => unsub();
  }, []);

  // inicializa drafts quando a lista chega
  useEffect(() => {
    setDraftPerms((prev) => {
      const next = { ...prev };
      for (const u of users) {
        if (!next[u.uid]) {
          next[u.uid] = { ...DEFAULT_PERMS, ...(u.permissions || {}) };
        }
      }
      return next;
    });
  }, [users]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const name = (u.displayName || "").toLowerCase();
      return email.includes(term) || name.includes(term) || u.uid.includes(term);
    });
  }, [users, q]);

  async function saveUserPerms(uid) {
    setBusy((b) => ({ ...b, [uid]: true }));
    try {
      await setUserPermissionsAdmin(uid, draftPerms[uid] || DEFAULT_PERMS);
    } finally {
      setBusy((b) => ({ ...b, [uid]: false }));
    }
  }

  async function toggleDisabled(uid, nextDisabled) {
    setBusy((b) => ({ ...b, [uid]: true }));
    try {
      await setUserDisabledAdmin(uid, nextDisabled);
    } finally {
      setBusy((b) => ({ ...b, [uid]: false }));
    }
  }

  async function clearData(uid) {
    const ok = window.confirm(
      "Tem certeza? Isso apaga clients/jobs/settings do Firestore desse usuário. (A conta de login NÃO é removida.)",
    );
    if (!ok) return;

    setBusy((b) => ({ ...b, [uid]: true }));
    try {
      await clearUserDataAdmin(uid);
    } finally {
      setBusy((b) => ({ ...b, [uid]: false }));
    }
  }

  async function deleteUser(uid) {
    const ok = window.confirm(
      "PERIGO: Tem certeza que deseja EXCLUIR este usuário? \n\nIsso apagará todos os dados e o removerá desta lista. (A conta de Autenticação precisa ser removida no painel Firebase Console, se necessário)."
    );
    if (!ok) return;

    setBusy((b) => ({ ...b, [uid]: true }));
    try {
      await deleteUserFS(uid);
    } finally {
      setBusy((b) => ({ ...b, [uid]: false }));
    }
  }

  function setPerm(uid, key, value) {
    setDraftPerms((p) => ({
      ...p,
      [uid]: { ...(p[uid] || DEFAULT_PERMS), [key]: value },
    }));
  }

  return (
    <Page>
      <Header>
        <Row $gap="12px">
          <Icon>
            <Shield size={18} />
          </Icon>
          <div>
            <Title>Administração</Title>
            <CardTitle>
              Somente o email <b>{ADMIN_EMAIL}</b> pode acessar esta tela.
            </CardTitle>
          </div>
        </Row>

        <Row $gap="10px">
          <SearchWrap>
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por email, nome ou UID..."
            />
          </SearchWrap>
          <Pill>{filtered.length} usuário(s)</Pill>
        </Row>
      </Header>

      <Grid $cols="1fr" $colsMobile="1fr">
        {filtered.map((u) => {
          const perms = draftPerms[u.uid] || { ...DEFAULT_PERMS, ...(u.permissions || {}) };
          const isBusy = Boolean(busy[u.uid]);
          const isOwnerAdmin = (u.email || "").toLowerCase() === ADMIN_EMAIL;

          return (
            <Card key={u.uid}>
              <Row $between $wrap>
                <Row $gap="10px" $wrap>
                  <UserDot $disabled={Boolean(u.disabled)} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.displayName || "Sem nome"}
                    </div>
                    <CardTitle style={{ wordBreak: "break-all" }}>
                      {(u.email || "—")} • <span style={{ opacity: 0.8 }}>uid:</span> {u.uid}
                    </CardTitle>
                  </div>
                  {u.disabled ? <Pill>desativado</Pill> : <Pill>ativo</Pill>}
                </Row>

                <Row $gap="10px" $wrap>
                  <Button
                    type="button"
                    onClick={() => toggleDisabled(u.uid, !u.disabled)}
                    disabled={isBusy || isOwnerAdmin}
                    title={isOwnerAdmin ? "Não desative o admin" : undefined}
                  >
                    {u.disabled ? <UserCheck size={18} /> : <UserX size={18} />}
                    {u.disabled ? "Reativar" : "Desativar"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => clearData(u.uid)}
                    disabled={isBusy || isOwnerAdmin}
                    title={isOwnerAdmin ? "Não limpe os dados do admin" : undefined}
                  >
                    <Trash2 size={18} /> Limpar Depto.
                  </Button>

                  <Button
                    type="button"
                    onClick={() => deleteUser(u.uid)}
                    disabled={isBusy || isOwnerAdmin}
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    title="Excluir usuário do banco de dados"
                  >
                    <Trash2 size={18} /> Excluir
                  </Button>
                </Row>
              </Row>

              <Divider />

              <Grid $cols="1fr 1fr" $colsMobile="1fr" $gap="12px">
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Acessos</div>
                  <PermRow>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(perms.dashboard)}
                        onChange={(e) => setPerm(u.uid, "dashboard", e.target.checked)}
                      />
                      Dashboard
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(perms.jobs)}
                        onChange={(e) => setPerm(u.uid, "jobs", e.target.checked)}
                      />
                      Jobs
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(perms.clientes)}
                        onChange={(e) => setPerm(u.uid, "clientes", e.target.checked)}
                      />
                      Clientes
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(perms.settings)}
                        onChange={(e) => setPerm(u.uid, "settings", e.target.checked)}
                      />
                      Configurações
                    </label>
                  </PermRow>
                  <CardTitle style={{ marginTop: 8 }}>
                    Isso afeta o menu e também bloqueia a rota se o usuário tentar abrir via URL.
                  </CardTitle>
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Salvar alterações</div>
                  <Row $gap="10px" $wrap>
                    <Button type="button" $variant="primary" onClick={() => saveUserPerms(u.uid)} disabled={isBusy}>
                      <Save size={18} /> Salvar permissões
                    </Button>
                    {isBusy ? <CardTitle>Processando...</CardTitle> : null}
                  </Row>
                </div>
              </Grid>
            </Card>
          );
        })}
      </Grid>
    </Page>
  );
}

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 920px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.div`
  font-weight: 950;
  letter-spacing: 0.2px;
  font-size: 18px;
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

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};

  input {
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    min-width: 240px;
  }

  @media (max-width: 920px) {
    input {
      min-width: 0;
      width: 100%;
    }
  }
`;

const PermRow = styled.div`
  display: grid;
  gap: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 10px;
    user-select: none;
    font-weight: 700;
  }

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.accent};
  }
`;

const UserDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme, $disabled }) => ($disabled ? theme.colors.muted : theme.colors.accent)};
  box-shadow: 0 0 0 4px ${({ theme, $disabled }) => ($disabled ? theme.colors.border : theme.colors.accentRing)};
`;
