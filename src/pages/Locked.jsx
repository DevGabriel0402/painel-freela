import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Button, Row, Grid } from "../components/ui";
import { Lock } from "lucide-react";
import styled from "styled-components";

export default function Locked() {
    const [params] = useSearchParams();
    const nav = useNavigate();
    const to = params.get("to");

    return (
        <Container>
            <Card style={{ maxWidth: 400, width: '100%' }}>
                <Row>
                    <Lock size={20} color="#ef4444" />
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Acesso bloqueado</div>
                </Row>
                <div style={{ marginTop: 12, opacity: 0.75, fontSize: 14, lineHeight: 1.5 }}>
                    Você não tem permissão para acessar esta área ({to || "restrita"}). Contate o administrador se precisar ou volte para o início.
                </div>

                <Row style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
                    <Button type="button" $variant="outline" onClick={() => nav("/dashboard")}>
                        Voltar
                    </Button>
                </Row>
            </Card>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
`;
