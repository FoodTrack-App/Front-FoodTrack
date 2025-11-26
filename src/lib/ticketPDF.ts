import { jsPDF } from "jspdf";

interface TicketData {
  restaurante: string;
  numeroTicket: number;
  mesa: {
    numeroMesa: number;
    nombrePersonalizado?: string;
  };
  mesero: string;
  fechaApertura: Date;
  items: Array<{
    nombreProducto: string;
    cantidad: number;
    precioBase: number;
    extras: Array<{
      nombreExtra: string;
      costoExtra: number;
    }>;
    comentarios?: string;
    precioTotal: number;
  }>;
  subtotal: number;
}

export function generateTicketPDF(data: TicketData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297], // Ancho de ticket térmico (80mm)
  });

  let yPos = 10;
  const lineHeight = 5;
  const pageWidth = 80;
  const margin = 5;

  // Función helper para centrar texto
  const centerText = (text: string, y: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Función helper para texto normal
  const normalText = (text: string, y: number, fontSize = 9) => {
    doc.setFontSize(fontSize);
    doc.text(text, margin, y);
  };

  // Encabezado - Nombre del restaurante
  doc.setFont("helvetica", "bold");
  centerText(data.restaurante.toUpperCase(), yPos, 14);
  yPos += lineHeight + 2;

  // Línea separadora
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += lineHeight;

  // Información de la cuenta
  doc.setFont("helvetica", "normal");
  normalText(`Ticket: #${data.numeroTicket}`, yPos);
  yPos += lineHeight;

  normalText(
    `Mesa: ${data.mesa.numeroMesa}${
      data.mesa.nombrePersonalizado ? ` (${data.mesa.nombrePersonalizado})` : ""
    }`,
    yPos
  );
  yPos += lineHeight;

  normalText(`Mesero: ${data.mesero}`, yPos);
  yPos += lineHeight;

  normalText(
    `Fecha: ${new Date(data.fechaApertura).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    yPos
  );
  yPos += lineHeight + 2;

  // Línea separadora
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += lineHeight;

  // Items
  doc.setFont("helvetica", "bold");
  normalText("ITEMS", yPos, 10);
  yPos += lineHeight;
  doc.setFont("helvetica", "normal");

  data.items.forEach((item) => {
    // Producto principal
    const itemLine = `${item.cantidad}x ${item.nombreProducto}`;
    normalText(itemLine, yPos, 9);
    yPos += lineHeight;

    // Precio base
    const precioLine = `   $${item.precioBase.toFixed(2)} c/u`;
    normalText(precioLine, yPos, 8);
    yPos += lineHeight;

    // Extras
    if (item.extras.length > 0) {
      item.extras.forEach((extra) => {
        const extraLine = `   + ${extra.nombreExtra} (+$${extra.costoExtra.toFixed(2)})`;
        normalText(extraLine, yPos, 8);
        yPos += lineHeight;
      });
    }

    // Comentarios
    if (item.comentarios) {
      normalText(`   Nota: ${item.comentarios}`, yPos, 7);
      yPos += lineHeight;
    }

    // Subtotal del item
    doc.setFont("helvetica", "bold");
    const itemTotal = `   Total: $${item.precioTotal.toFixed(2)}`;
    normalText(itemTotal, yPos, 9);
    yPos += lineHeight + 1;
    doc.setFont("helvetica", "normal");
  });

  // Línea separadora
  yPos += 1;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += lineHeight;

  // Total
  doc.setFont("helvetica", "bold");
  normalText(`TOTAL:`, yPos, 12);
  doc.setFontSize(12);
  const totalText = `$${data.subtotal.toFixed(2)}`;
  const totalWidth = doc.getTextWidth(totalText);
  doc.text(totalText, pageWidth - margin - totalWidth, yPos);
  yPos += lineHeight + 3;

  // Línea separadora
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += lineHeight + 2;

  // Pie de página
  doc.setFont("helvetica", "normal");
  centerText("¡Gracias por su preferencia!", yPos, 10);
  yPos += lineHeight;
  centerText("Vuelva pronto", yPos, 9);

  // Guardar PDF
  doc.save(`ticket-${data.numeroTicket}.pdf`);
}
