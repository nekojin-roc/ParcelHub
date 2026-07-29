import PDFDocument from "pdfkit";
import { renderBarcodePng } from "../utils/barcode.js";

// A label printer is "connected" when its address is configured.
// Until real printer integration lands, leave LABEL_PRINTER_HOST unset
// and callers fall back to PDF download.
export function isLabelPrinterConnected(): boolean {
  return Boolean(process.env.LABEL_PRINTER_HOST);
}

export async function printLabel(barcode: string): Promise<boolean> {
  if (!isLabelPrinterConnected()) return false;
  // TODO: send to the label printer at LABEL_PRINTER_HOST (e.g. via IPP/CUPS).
  console.warn(
    `Label printer configured but printing not implemented; skipping print for ${barcode}`
  );
  return false;
}

// Render a 4in x 2in label PDF with the barcode centered.
export async function renderLabelPdf(barcode: string): Promise<Buffer> {
  const png = await renderBarcodePng(barcode);

  const widthPt = 288; // 4in
  const heightPt = 144; // 2in
  const margin = 18;

  const doc = new PDFDocument({ size: [widthPt, heightPt], margin: 0 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.image(png, margin, margin, {
    fit: [widthPt - margin * 2, heightPt - margin * 2],
    align: "center",
    valign: "center",
  });
  doc.end();

  return done;
}
