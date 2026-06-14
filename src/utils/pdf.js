import { jsPDF } from 'jspdf';

export function exportToPDF(category, inputValues, responseSections, filename = 'Bericht.pdf') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let y = 20;

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`KiKat Bericht: ${category.name}`, margin, y);
  y += 10;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generiert am: ${new Date().toLocaleString('de-DE')}`, margin, y);
  y += 10;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Eingegebene Parameter (Ebene 1)', margin, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  for (const field of category.fields) {
    const value = inputValues[field.name];
    if (value === undefined || value === null || value === '') continue;

    checkPageBreak(12);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${field.label}:`, margin, y);
    
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    let displayVal = String(value);
    if (field.type === 'file') {
      displayVal = '[Bilddatei beigefügt]';
    }

    const labelOffset = 45;
    const lines = doc.splitTextToSize(displayVal, contentWidth - labelOffset);
    doc.text(lines, margin + labelOffset, y);
    y += (lines.length * 5) + 3;
  }

  y += 5;
  checkPageBreak(10);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('KI-Ergebnisse (Ebene 3)', margin, y);
  y += 8;

  for (const section of responseSections) {
    checkPageBreak(15);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 54, 93);
    doc.text(section.title || 'Abschnitt', margin, y);
    y += 6;

    const contentText = (section.content || '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    const bodyLines = doc.splitTextToSize(contentText, contentWidth);
    for (const line of bodyLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 5;
  }

  doc.save(filename);
}
