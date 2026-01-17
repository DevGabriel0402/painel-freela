import styled from "styled-components";

export const Page = styled.div`
  display: grid;
  gap: 14px;
`;

export const Grid = styled.div`
  display: grid;
  gap: ${({ $gap }) => $gap || "12px"};
  grid-template-columns: ${({ $cols }) => $cols || "1fr"};

  @media (max-width: 920px) {
    grid-template-columns: ${({ $colsMobile }) => $colsMobile || "1fr"};
  }
`;

export const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  padding: 14px;
`;

export const CardTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

export const CardValue = styled.div`
  margin-top: 8px;
  font-size: 18px;
  font-weight: 850;
  letter-spacing: 0.2px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap || "10px"};
  justify-content: ${({ $between }) => ($between ? "space-between" : "flex-start")};
`;

export const Stack = styled.div`
  display: grid;
  gap: ${({ $gap }) => $gap || "10px"};
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 10px 0;
`;

export const Input = styled.input`
  width: 100%;
  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accentRing};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accentRing};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  min-height: 90px;
  resize: vertical;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accentRing};
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 11px 12px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  background: ${({ $variant, theme }) => {
    if ($variant === "primary") return theme.colors.accent;
    if ($variant === "danger")
      return theme.mode === "dark" ? "rgba(255,77,109,0.95)" : "rgba(220,50,70,0.92)";
    return theme.colors.surface;
  }};

  color: ${({ $variant, theme }) =>
    $variant === "primary" ? theme.colors.accentText : theme.colors.text};

  transition:
    transform 0.12s ease,
    filter 0.12s ease,
    background 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
  &:active {
    transform: translateY(0px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface2};
  color: ${({ theme }) => theme.colors.muted};
`;
