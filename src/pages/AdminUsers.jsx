import { useEffect, useState } from "react";
import { subscribeAllUsers, updateUserDoc, deleteUserDoc } from "../app/firestore";
import { Card, Page, Row, Button, Pill, Grid } from "../components/ui";
import { Shield, Trash2, CheckCircle2, XCircle, LayoutGrid, Briefcase, Users, Settings } from "lucide-react";
import styled from "styled-components";

const TABS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={14} /> },
    { id: "jobs", label: "Jobs", icon: <Briefcase size={14} /> },
    { id: "clients", label: "Clientes", icon: <Users size={14} /> },
    { id: "settings", label: "Config", icon: <Settings size={14} /> },
];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeAllUsers((data) => {
            setUsers(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    function toggleTab(user, tabId) {
        const currentTabs = user.allowedTabs || TABS.map((t) => t.id);
        let newTabs;
        if (currentTabs.includes(tabId)) {
            newTabs = currentTabs.filter((t) => t !== tabId);
        } else {
            newTabs = [...currentTabs, tabId];
        }
        updateUserDoc(user.id, { allowedTabs: newTabs });
    }

    function toggleBan(user) {
        updateUserDoc(user.id, { disabled: !user.disabled });
    }

    // Not implementing delete for now to be safe, just Disable
    // function handleDelete(uid) {
    //   if(confirm("Tem certeza que deseja apagar os DADOS deste usuário? O login ainda funcionará, mas os dados sumirão.")) {
    //       deleteUserDoc(uid);
    //   }
    // }

    if (loading) return <div>Carregando usuários...</div>;

    return (
        <Page>
            <Row $between>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Shield size={24} color="#7e22ce" />
                    <h1>Administração</h1>
                </div>
                <Pill>{users.length} usuários</Pill>
            </Row>

            <Grid $cols="1fr" $gap="12px">
                {users.map((u) => {
                    const allowedTabs = u.allowedTabs || TABS.map(t => t.id);
                    return (
                        <Card key={u.id}>
                            <Grid $cols="1fr auto" $colsMobile="1fr">
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: 16 }}>{u.displayName || "Sem Nome"}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7 }}>{u.email}</div>
                                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{u.id}</div>

                                    {u.disabled && <Pill style={{ marginTop: 8, background: '#ef4444', color: 'white' }}>BLOQUEADO</Pill>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        {TABS.map(tab => {
                                            const isActive = allowedTabs.includes(tab.id);
                                            return (
                                                <TabToggle
                                                    key={tab.id}
                                                    $active={isActive}
                                                    onClick={() => toggleTab(u, tab.id)}
                                                    title={isActive ? "Acesso permitido" : "Acesso bloqueado"}
                                                >
                                                    {tab.icon} {tab.label}
                                                </TabToggle>
                                            )
                                        })}
                                    </div>

                                    <Button $variant={u.disabled ? "primary" : "danger"} onClick={() => toggleBan(u)}>
                                        {u.disabled ? "Desbloquear Usuário" : "Bloquear Usuário"}
                                    </Button>
                                </div>
                            </Grid>
                        </Card>
                    )
                })}
            </Grid>
        </Page>
    );
}

const TabToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 20px;
    border: 1px solid ${({ theme, $active }) => $active ? theme.colors.accent : theme.colors.border};
    background: ${({ theme, $active }) => $active ? theme.colors.accentSoft : 'transparent'};
    color: ${({ theme, $active }) => $active ? theme.colors.accent : theme.colors.muted};
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    opacity: ${({ $active }) => $active ? 1 : 0.5};

    &:hover {
        opacity: 1;
    }
`;
