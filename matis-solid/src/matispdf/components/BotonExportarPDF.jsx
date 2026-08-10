import { createSignal } from "solid-js";
import { generatePDFReport } from "../services/pdfGenerator";

export default function BotonExportarPDF(props) {
  const [isExporting, setIsExporting] = createSignal(false);

  const handleExport = async (e) => {
    e.preventDefault();
    if (isExporting()) return;

    setIsExporting(true);
    try {
      // Buscar elementos DOM usando selectores en el contexto de la tarjeta actual
      const card = e.currentTarget.closest('.chart-card') || document;
      
      let chartElement = null;
      if (props.chartSelector) {
        chartElement = card.querySelector(props.chartSelector);
      }
        
      let tableElement = null;
      if (props.tableSelector) {
        tableElement = card.querySelector(props.tableSelector);
      }

      await generatePDFReport({
        title: props.title || "Reporte",
        subtitle: props.subtitle || "",
        chartElement,
        tableElement,
        filename: props.filename || "reporte.pdf"
      });
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      alert("Hubo un error al generar el documento PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting()}
      style={{
        display: "flex",
        "align-items": "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        "background-color": isExporting() ? "#6c757d" : "#0f172a",
        color: "#ffffff",
        border: "none",
        "border-radius": "4px",
        "font-weight": "600",
        cursor: isExporting() ? "not-allowed" : "pointer",
        transition: "background-color 0.2s",
        "font-size": "0.875rem",
        "text-transform": "uppercase",
        "letter-spacing": "0.05em"
      }}
      title="Exportar reporte en formato PDF"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      {isExporting() ? "Generando..." : "Exportar PDF"}
    </button>
  );
}
