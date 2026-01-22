import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getDataUri = (url) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

export async function printReportAsPDF({ title, subtitle, summaryRows, sections, appName, logoUrl, themeColor }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Colors
  // Use passed themeColor (accent) or default black/dark
  const accentRGB = themeColor ? hexToRgb(themeColor) : [20, 20, 20];
  const headerBg = [20, 20, 22]; // #141416 (Dark surface)
  const textLight = [255, 255, 255];
  const textDark = [40, 40, 40];
  const textMuted = [100, 100, 100];

  // Helper to draw rounded rect
  const roundedRect = (x, y, w, h, r, col) => {
    doc.setFillColor(...col);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // --- Header ---
  // Draw full width header background
  const headerHeight = 36;
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  let cursorY = 24;
  const margin = 14;

  // Load Logo
  let logoData = null;
  if (logoUrl) {
    logoData = await getDataUri(logoUrl);
  }

  // Logo & App Name
  if (logoData) {
    const imgSize = 14;
    // Center vertically in headerHeight (36) -> (36 - 14)/2 = 11
    doc.addImage(logoData, "PNG", margin, 11, imgSize, imgSize);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textLight);
    doc.text((appName || "Sistema").toUpperCase(), margin + imgSize + 6, 21);
  } else {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textLight);
    doc.text((appName || "Sistema").toUpperCase(), margin, 21);
  }

  // Right Side Title
  // User requested ONLY "RELATÓRIO MENSAL" in large font (matching left side)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textLight); // white
  const mainTitle = "RELATÓRIO MENSAL";
  const titleWidth = doc.getTextWidth(mainTitle);
  doc.text(mainTitle, pageWidth - margin - titleWidth, 21); // Align visually with left text

  // Subtitle (Generated date) below header
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  // I'll append the month name to the subtitle for clarity, or just leave subtitle as is (generated date).
  // Current subtitle passed is just the date string.
  const fullSubtitle = `${subtitle}`;
  doc.text(fullSubtitle, pageWidth - margin, headerHeight + 6, { align: 'right' });


  // --- Summary Cards (KPIs) ---
  cursorY = headerHeight + 14;

  if (summaryRows && summaryRows.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text("Resumo Financeiro", margin, cursorY);
    cursorY += 6;

    const gap = 6;
    const cardWidth = (pageWidth - (margin * 2) - (gap * 3)) / 4;
    const cardHeight = 24;

    summaryRows.forEach((row, index) => {
      const x = margin + (index * (cardWidth + gap));
      // Draw card background (very light gray)
      roundedRect(x, cursorY, cardWidth, cardHeight, 3, [248, 249, 250]);

      // Draw thin top border with accent color? Or just left border?
      // Let's do a left colored strip
      doc.setFillColor(...accentRGB);
      doc.rect(x, cursorY + 4, 1.5, cardHeight - 8, 'F');

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textMuted);
      doc.text(row[0], x + 6, cursorY + 8);

      // Value
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textDark);
      doc.text(String(row[1]), x + 6, cursorY + 20);
    });

    cursorY += cardHeight + 16;
  }

  // --- Sections (Tables) ---
  if (sections) {
    sections.forEach(section => {
      // Check page break
      if (cursorY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textDark);

      // Section styling (maybe a small colored dot?)
      doc.setFillColor(...accentRGB);
      doc.circle(margin + 1, cursorY - 1, 1.5, 'F');
      doc.text(section.title, margin + 6, cursorY);
      cursorY += 4;

      autoTable(doc, {
        startY: cursorY,
        head: [section.headers],
        body: section.rows,
        theme: 'grid', // grid theme has borders
        headStyles: {
          fillColor: headerBg, // Match the dark header or accent? Let's use headerBg for "System UI" feel
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          lineWidth: 0,
          cellPadding: 6
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [230, 230, 230],
          lineWidth: 0.1,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [252, 252, 253]
        },
        columnStyles: {
          // align currency right?
          // difficult to know strictly which column is currency generally, 
          // but usually last columns. Leaving left aligned is safer for generic.
        },
        margin: { left: margin, right: margin }
      });

      cursorY = doc.lastAutoTable.finalY + 14;
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    // Draw footer line
    doc.setDrawColor(240, 240, 240);
    doc.line(margin, doc.internal.pageSize.height - 14, pageWidth - margin, doc.internal.pageSize.height - 14);

    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 8, { align: 'right' });
    doc.text(appName || "Sistema", margin, doc.internal.pageSize.height - 8);
  }

  // Print logic: Open PDF with auto-print script
  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
