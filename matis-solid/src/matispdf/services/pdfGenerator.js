import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

/**
 * Genera un reporte PDF profesional a partir de los elementos del DOM de una gráfica y su tabla.
 *
 * @param {Object} config Configuración para el PDF
 * @param {string} config.title Título principal del reporte
 * @param {string} config.subtitle Subtítulo o descripción del reporte
 * @param {HTMLElement} config.chartElement Elemento DOM que contiene la gráfica a capturar (opcional)
 * @param {HTMLElement} config.tableElement Elemento DOM de la tabla (<tr>, <th>, <td>) para usar autoTable (opcional)
 * @param {string} config.filename Nombre del archivo PDF a descargar
 */
export const generatePDFReport = async ({
  title = "Reporte Analítico",
  subtitle = "",
  chartElement = null,
  tableElement = null,
  filename = "reporte_matis.pdf"
}) => {
  // Inicializa el documento PDF en formato A4, vertical, unidades en mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // --- ENCABEZADO INSTITUCIONAL ---
  const accentColor = [33, 37, 41]; 
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...accentColor);
  doc.text("SISTEMA MATIS", margin, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const fecha = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
  const dateText = `Generado: ${fecha}`;
  doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), currentY + 5);

  currentY += 10;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 12;

  // --- TÍTULO DEL REPORTE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  
  const titleLines = doc.splitTextToSize(title, pageWidth - (margin * 2));
  doc.text(titleLines, margin, currentY);
  currentY += (titleLines.length * 7);

  // --- SUBTÍTULO ---
  if (subtitle) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const subtitleLines = doc.splitTextToSize(subtitle, pageWidth - (margin * 2));
    doc.text(subtitleLines, margin, currentY);
    currentY += (subtitleLines.length * 5) + 5;
  } else {
    currentY += 5;
  }

  // --- CAPTURA DE GRÁFICA (VÍA HTML2CANVAS) ---
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2, // Mayor calidad para impresión
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      
      const availableWidth = pageWidth - (margin * 2);
      const imgHeight = (imgProps.height * availableWidth) / imgProps.width;
      
      if (currentY + imgHeight > pageHeight - margin - 15) {
        doc.addPage();
        currentY = margin + 10;
      }

      doc.addImage(imgData, "PNG", margin, currentY, availableWidth, imgHeight);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, currentY, availableWidth, imgHeight);

      currentY += imgHeight + 15;
    } catch (err) {
      console.error("Error al capturar la gráfica para el PDF:", err);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text("No se pudo adjuntar la gráfica al reporte.", margin, currentY);
      currentY += 10;
    }
  }

  // --- TABLA DE DATOS (VÍA JSPDF-AUTOTABLE) ---
  if (tableElement) {
    autoTable(doc, {
      html: tableElement,
      startY: currentY,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 4,
        textColor: [40, 40, 40],
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      margin: { left: margin, right: margin, bottom: margin + 15 },
      showHead: 'everyPage',
      didDrawPage: (data) => {
        const currentPage = doc.internal.getNumberOfPages();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        
        const footerY = pageHeight - 10;
        doc.text("Documento generado automáticamente por MATIS.", margin, footerY);
        const pageText = `Página ${currentPage}`;
        doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), footerY);
      }
    });
  } else {
    const footerY = pageHeight - 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento generado automáticamente por MATIS.", margin, footerY);
    const pageText = `Página ${doc.internal.getNumberOfPages()}`;
    doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), footerY);
  }

  doc.save(filename);
};
