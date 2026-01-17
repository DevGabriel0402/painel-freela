export function printReportAsPDF({ title, subtitle, summaryRows, sections }) {
  const w = window.open("", "_blank");
  if (!w) return;

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { margin: 0; font-size: 20px; }
        .sub { margin-top: 6px; color: #444; font-size: 12px; }
        .box { margin-top: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .k { font-size: 12px; color: #666; }
        .v { font-weight: 700; margin-top: 2px; }
        h2 { margin: 18px 0 8px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom: 1px solid #eee; padding: 9px 8px; text-align: left; font-size: 12px; vertical-align: top; }
        th { font-size: 12px; color: #444; }
        .muted { color: #666; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="sub">${subtitle}</div>

      <div class="box">
        <div class="grid">
          ${summaryRows
            .map(
              ([k, v]) => `<div><div class="k">${k}</div><div class="v">${v}</div></div>`,
            )
            .join("")}
        </div>

        ${(sections || [])
          .map(
            (s) => `
              <h2>${s.title}</h2>
              <table>
                <thead>
                  <tr>${s.headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                </thead>
                <tbody>
                  ${s.rows
                    .map(
                      (r) =>
                        `<tr>${r.map((c) => `<td>${String(c ?? "")}</td>`).join("")}</tr>`,
                    )
                    .join("")}
                </tbody>
              </table>
            `,
          )
          .join("")}

        <div class="muted" style="margin-top:12px;font-size:11px;">
          Dica: no diálogo de impressão, escolha “Salvar como PDF”.
        </div>
      </div>

      <script>
        window.onload = () => { window.print(); };
      </script>
    </body>
  </html>
  `;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
