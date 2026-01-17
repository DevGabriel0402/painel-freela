import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../app/auth";
import { subscribeFeedbacks, addFeedback, deleteFeedback } from "../app/firestore";
import { getInitials } from "../app/utils";
import {
    Page,
    Card,
    Row,
    Button,
    Input,
    Textarea,
    Grid,
} from "../components/ui";
import { Star, MessageSquare, Trash2 } from "lucide-react";

export default function Feedback({ profile }) {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unsub = subscribeFeedbacks((data) => {
            setFeedbacks(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            await addFeedback(user.uid, {
                rating,
                text,
                userName: user.displayName || "Usuário",
                userPhoto: user.photoURL,
            });
            setText("");
            setRating(5);
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            alert("Erro ao enviar feedback.");
        } finally {
            setSubmitting(false);
        }
    }

    const isAdmin = profile?.permissions?.admin;

    return (
        <Page>
            <Header>
                <div>
                    <Title>Mural de Feedback</Title>
                    <Sub>Veja o que a comunidade está dizendo e deixe sua opinião.</Sub>
                </div>
            </Header>

            <Grid $cols="1.2fr 2fr" $colsMobile="1fr" style={{ alignItems: "start" }}>

                {/* Form Section */}
                <Card>
                    <Row style={{ marginBottom: 12 }}>
                        <IconBox>
                            <MessageSquare size={20} />
                        </IconBox>
                        <div style={{ fontWeight: 800 }}>Deixe seu depoimento</div>
                    </Row>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                                Nota
                            </label>
                            <Row>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <StarButton
                                        type="button"
                                        key={s}
                                        $active={s <= rating}
                                        onClick={() => setRating(s)}
                                    >
                                        <Star size={24} fill={s <= rating ? "gold" : "transparent"} />
                                    </StarButton>
                                ))}
                            </Row>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
                                Comentário
                            </label>
                            <Textarea
                                rows={4}
                                placeholder="Conte o que está achando do sistema..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                required
                            />
                        </div>

                        <Button $variant="primary" type="submit" disabled={submitting}>
                            {submitting ? "Enviando..." : "Publicar Avaliação"}
                        </Button>
                    </form>
                </Card>

                {/* List Section */}
                <div style={{ display: "grid", gap: 16 }}>
                    {loading && <Sub>Carregando avaliações...</Sub>}

                    {!loading && feedbacks.length === 0 && (
                        <Card style={{ textAlign: "center", padding: 40 }}>
                            <Sub>Nenhuma avaliação ainda. Seja o primeiro!</Sub>
                        </Card>
                    )}

                    {feedbacks.map((item) => {
                        const isOwner = user?.uid === item.uid;
                        return (
                            <Card key={item.id} style={{ position: 'relative' }}>
                                <Row $between style={{ alignItems: "flex-start", marginBottom: 10 }}>
                                    <Row>
                                        <Avatar>
                                            {getInitials(item.userName)}
                                        </Avatar>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{item.userName}</div>
                                            <Row $gap="2px">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        size={12}
                                                        color={s <= item.rating ? "gold" : "#ccc"}
                                                        fill={s <= item.rating ? "gold" : "transparent"}
                                                    />
                                                ))}
                                                <DateText>
                                                    • {new Date(item.createdAt).toLocaleDateString()}
                                                </DateText>
                                            </Row>
                                        </div>
                                    </Row>

                                    {(isOwner || isAdmin) && (
                                        <Button
                                            size="icon"
                                            $variant="danger"
                                            onClick={() => {
                                                if (confirm("Excluir este feedback?")) deleteFeedback(item.id);
                                            }}
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </Row>
                                <CommentText>{item.text}</CommentText>
                            </Card>
                        );
                    })}
                </div>
            </Grid>
        </Page>
    );
}

const IconBox = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.surface2};
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.accent};
`;

const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${({ $active }) => ($active ? "gold" : "#ccc")};
  transition: transform 0.1s;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const DateText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
  margin-left: 6px;
`;

const CommentText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
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
`;
