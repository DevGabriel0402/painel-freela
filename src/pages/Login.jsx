import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../app/auth";
import { Button } from "../components/ui";
import Logo from "../assets/Freela Logo.PNG";
import GoogleIcon from "../assets/google-icon.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await loginWithEmail(email, password);
      // Opcional: garantir que o perfil existe se tido sido criado manualmente
      // await createUserProfile(user.uid, { email: user.email });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao logar com Google.");
    }
  }

  return (
    <Container>
      <Card>
        <img src={Logo} alt="Freela Logo" />
        <Subtitle>Acesse seu painel do Flowyhub</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={loading} $fullWidth>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Form>

        <Divider>ou</Divider>

        <GoogleButton type="button" onClick={handleGoogle}>
          <img src={GoogleIcon} alt="Google Icon" /> Continuar com Google
        </GoogleButton>

        <FooterText>
          Não tem uma conta? <StyledLink to="/register">Crie agora</StyledLink>
        </FooterText>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  padding: 1rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.cardBg};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.textSec};
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  background-color: #ef444415;
  padding: 0.5rem;
  border-radius: 6px;
`;

const Divider = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.textSec};
  font-size: 0.85rem;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background-color: ${({ theme }) => theme.border};
  }

  &::before {
    left: 0;
  }
  &::after {
    right: 0;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;

  img {
    height: 30px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.textSec};
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;
