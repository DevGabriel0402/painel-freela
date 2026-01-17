import styled from "styled-components";
import { X } from "lucide-react";

export default function Modal({ open, title, subtitle, onClose, children }) {
  if (!open) return null;

  function onBackdrop(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <Backdrop onMouseDown={onBackdrop}>
      <Dialog role="dialog" aria-modal="true">
        <Header>
          <div>
            <Title>{title}</Title>
            {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
          </div>

          <CloseBtn onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </CloseBtn>
        </Header>

        <Body>{children}</Body>
      </Dialog>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 14px;
`;

const Dialog = styled.div`
  width: min(720px, 100%);
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  overflow: hidden;
`;

const Header = styled.div`
  padding: 14px 14px 12px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.div`
  font-weight: 900;
  letter-spacing: 0.2px;
`;

const Subtitle = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const CloseBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border-radius: 12px;
  padding: 8px;
  display: grid;
  place-items: center;

  &:hover {
    filter: brightness(1.06);
  }
`;

const Body = styled.div`
  padding: 14px;
`;
