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
`;
