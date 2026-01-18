import styled, { keyframes, useTheme } from "styled-components";
import { SiFluxus } from "react-icons/si";

export default function LoadingScreen() {
    const theme = useTheme();

    return (
        <Container>
            <IconWrapper>
                {/* Background Icon (Empty/Dimmed) */}
                <SiFluxus size={80} color={theme.colors.border} />

                {/* Foreground Icon (Filling) */}
                <FillContainer>
                    <div className="inner-icon">
                        <SiFluxus size={80} color={theme.colors.accent} />
                    </div>
                </FillContainer>
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
    width: 80px;
    height: 80px;
`;

const FillContainer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    animation: ${fill} 2s ease-in-out infinite;

    /* Inner container to hold the icon fixed relative to the wrapper */
    .inner-icon {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
