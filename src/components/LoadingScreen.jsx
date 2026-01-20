import styled, { keyframes, useTheme } from "styled-components";
import { SiFluxus } from "react-icons/si";

export default function LoadingScreen() {
  const theme = useTheme();
  const baseColor = theme.mode === "dark" ? theme.colors.surface2 : theme.colors.border;
  const accentColor = theme.colors.accent;
  const haloColor =
    theme.mode === "dark" ? theme.colors.accentRing : theme.colors.accentSoft;

  return (
    <Container>
      <IconWrapper $halo={haloColor}>
        <SiFluxus size={80} color={baseColor} />
        <SiFluxus size={80} color={accentColor} />
      </IconWrapper>
    </Container>
  );
}

const fill = keyframes`
  0% { height: 0%; }
  50% { height: 100%; }
  100% { height: 0%; }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.bg};
  display: grid;
  place-items: center;
  z-index: 9999;
`;

const IconWrapper = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  border-radius: 28px;
  background: ${({ theme }) =>
    theme.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)"};
  box-shadow: 0 12px 32px ${({ $halo }) => $halo};
  padding: 14px;
`;

const FillContainer = styled.div`
  position: absolute;
  bottom: 14px;
  left: 14px;
  width: calc(100% - 28px);
  height: calc(100% - 28px);
  overflow: hidden;
  animation: ${fill} 2s ease-in-out infinite;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      ${({ $accent }) => $accent} 0%,
      ${({ $accent }) => $accent}66 55%,
      ${({ $accent }) => $accent}2b 100%
    );
    opacity: 0.85;
    z-index: 1;
  }

  .inner-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
`;
