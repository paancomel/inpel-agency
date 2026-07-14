import { Download, FileText, X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

interface PdfReportDialogProps {
  open: boolean;
  onClose: () => void;
  reportRef: RefObject<HTMLElement | null>;
  sessionId: string;
}

const reportSections = [
  { id: "overview", label: "Profile overview" },
  { id: "matches", label: "University matches" },
  { id: "roi", label: "ROI and career outlook" },
  { id: "scholarships", label: "Scholarship actions" },
] as const;

export function PdfReportDialog({ open, onClose, reportRef, sessionId }: PdfReportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState(reportSections.map((section) => section.id));
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  async function generatePdf() {
    const report = reportRef.current;
    if (!report || selected.length === 0) {
      setStatus("error");
      return;
    }

    setStatus("working");
    const sections = Array.from(report.querySelectorAll<HTMLElement>("[data-report-section]"));
    const previousDisplay = sections.map((section) => section.style.display);
    sections.forEach((section) => {
      if (!selected.includes(section.dataset.reportSection as (typeof selected)[number])) section.style.display = "none";
    });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("PDF rendering timed out.")), 12_000);
      });
      const canvas = await Promise.race([html2canvas(report, { scale: 1.35, useCORS: true, backgroundColor: "#f8fafc" }), timeout]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = 190;
      const pageHeight = 277;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const image = canvas.toDataURL("image/jpeg", 0.9);
      let remaining = imageHeight;
      let position = 10;
      pdf.addImage(image, "JPEG", 10, position, pageWidth, imageHeight, undefined, "FAST");
      remaining -= pageHeight;
      while (remaining > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(image, "JPEG", 10, position, pageWidth, imageHeight, undefined, "FAST");
        remaining -= pageHeight;
      }
      pdf.save(`INPEL-report-${sessionId.slice(0, 8)}.pdf`);
      setStatus("idle");
      onClose();
    } catch {
      setStatus("error");
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      sections.forEach((section, index) => { section.style.display = previousDisplay[index] ?? ""; });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="pdf-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg bg-transparent p-0 backdrop:bg-ink/60"
    >
      <div className="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center bg-mint text-leaf"><FileText className="size-5" /></span><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close PDF settings" className="p-2 text-slate-500 hover:text-forest"><X className="size-5" /></button></div>
        <h2 id="pdf-title" className="mt-5 font-display text-3xl font-bold text-forest">Build your family report</h2>
        <p className="mt-2 leading-6 text-slate-600">Choose the sections to include. Generation can take a few seconds on older devices.</p>
        <fieldset className="mt-6 space-y-2"><legend className="sr-only">PDF sections</legend>{reportSections.map((section) => <label key={section.id} className="flex cursor-pointer items-center gap-3 border border-slate-200 p-3"><input type="checkbox" checked={selected.includes(section.id)} onChange={() => setSelected((current) => current.includes(section.id) ? current.filter((item) => item !== section.id) : [...current, section.id])} className="size-4 accent-leaf" /><span className="font-semibold text-forest">{section.label}</span></label>)}</fieldset>
        {status === "error" && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">Select at least one section, then try again. If rendering still fails, close other memory-heavy tabs.</p>}
        <button type="button" disabled={status === "working"} onClick={() => { void generatePdf(); }} className="mt-6 flex w-full items-center justify-center gap-2 bg-forest px-6 py-4 font-bold text-white hover:bg-leaf disabled:opacity-60"><Download className="size-5" />{status === "working" ? "Generating report…" : "Generate PDF Report"}</button>
      </div>
    </dialog>
  );
}
