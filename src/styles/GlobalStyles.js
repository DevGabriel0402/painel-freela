import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }

  /* Privacy mode: blur valores/dados sensíveis */
  body.privacy-on [data-sensitive="true"] {
    filter: blur(8px);
    user-select: none;
  }

  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }

  /* Fix native date input text color (browser default is blue) */
  input[type="date"],
  input[type="datetime-local"],
  input[type="time"] {
    color: inherit;
    color-scheme: ${({ theme }) => theme.mode === "dark" ? "dark" : "light"};
  }

  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="datetime-local"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) => theme.mode === "dark" ? "invert(1)" : "none"};
    cursor: pointer;
  }

  @media(max-width: 600px) {
    .mobile-hide { display: none; }
  }

  @media(min-width: 921px) {
    .mobile-only { display: none !important; }
  }
`;
