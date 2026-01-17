import { useState, useEffect } from "react";
import styled from "styled-components";
import { Cookie } from "lucide-react";
import { useLocalStorage } from "../app/useLocalStorage";

export default function CookieConsent() {
    const [seen, setSeen] = useLocalStorage("cookie_consent_v1", false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Delay show slightly to not jar user
        if (!seen) {
            const t = setTimeout(() => setVisible(true), 1000);
            return () => clearTimeout(t);
        }
    }, [seen]);

    if (seen || !visible) return null;

    function handleAccept() {
        setSeen(true);
        setVisible(false);
    }

    function handleDecline() {
        // Optionally store "declined" if needed, for MVP we just hide it
        // But setting 'seen' to true prevents it from showing again.
        setSeen(true);
        setVisible(false);
    }

    return (
        <Container role="alert">
            <Content>
                <IconWrap>
                    <Cookie size={24} />
                </IconWrap>
                <div>
                    <Title>Este site utiliza cookies</Title>
                    <Text>
                        Usamos cookies para melhorar sua experiência e analisar o tráfego. Ao
                        continuar, você concorda com nossa política de privacidade.
                    </Text>
                </div>
            </Content>
            <Actions>
                <DeclineBtn onClick={handleDecline}>Recusar</DeclineBtn>
                <AcceptBtn onClick={handleAccept}>Aceitar</AcceptBtn>
            </Actions>
        </Container>
    );
}

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 360px;
  max-width: calc(100% - 40px);
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideIn 0.5s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Content = styled.div`
  display: flex;
  gap: 12px;
`;

const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
`;

const Title = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`;

const Text = styled.div`
  font-size: 13px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.muted};
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const BaseBtn = styled.button`
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const DeclineBtn = styled(BaseBtn)`
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.colors.surface2};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AcceptBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;
