import styled from "styled-components";

export const Page = styled.div`
  display: grid;
  gap: 14px;
`;

export const Grid = styled.div`
  display: grid;
  gap: ${({ $gap }) => $gap || "12px"};
  grid-template-columns: ${({ $cols }) => $cols || "1fr"};
  max-width: 100%;

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
  width: 100%;
  min-width: 250px;
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
  flex-wrap: ${({ $wrap }) => ($wrap ? "wrap" : "nowrap")};
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
  
  /* Reset for iOS */
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  box-sizing: border-box; /* Ensure padding doesn't widen the element */

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.accentRing};
  }

  /* Specific fix for date inputs on mobile */
  &[type="date"] {
    appearance: none;
    -webkit-appearance: none;
    min-height: 44px;
    display: block;
    width: 100%;
    min-width: 250px !important;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.text};
    position: relative;


    &::-webkit-date-and-time-value {
      text-align: left;
    }

    /* User requested styles for date input */
    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      filter: invert(0.5);
      /* "Sem a seta" - if interpreted as hiding the arrow, uncomment below. 
         However, user provided styling for it, so we apply the styling. 
         To hide it completely as per "sem a seta" (without arrow), we set opacity 0 but keep it clickable over the input?
         Or just hide it. Let's try hiding it if that's the strict instruction, 
         but keeping the code confirms we saw it.
         
         Decision: Make it transparent and span common area if possible, 
         OR just apply the requested filter. 
         "sem a seta" likely means "no default arrow". 
         I will use the filter. If they want it GONE GONE, display: none.
         
         RE-READING: "faça com que esse input-date seja um dropdown tambem porem sem a seta"
         Maybe it implies acting like a select but no arrow icon?
         I'll hide the indicator but make the text blue.
      */
      opacity: 0; /* Hiding it as requested "sem a seta" but keeping it in DOM might still allow click? */
      display: none; /* Safest "sem a seta" visual interpretation */
    }

    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-year-field {
        color: #0070f3; /* Azul padrão do Next.js */
        text-transform: uppercase;
    }

    &::-webkit-datetime-edit-text {
        color: #ccc;
        padding: 0 2px;
    }
  }

  /* Match pseudo-class states with SelectTrigger */
  transition: all 0.2s ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.accentSoft};
  }

`;

import CustomSelect from "./CustomSelect";

// Export CustomSelect as named export 'Select'
export const Select = CustomSelect;


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
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

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
