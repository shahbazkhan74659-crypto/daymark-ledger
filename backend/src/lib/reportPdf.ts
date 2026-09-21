import pdfMake, { type TDocumentDefinitions, type TableLayout, type ContentCell } from "pdfmake";
import helveticaFonts from "pdfmake/standard-fonts/Helvetica.js";
import type { ReportData } from "./reportData.js";
import { REPORT_FIELD_LABELS, REPORT_MONTH_NAMES, type ReportFieldKey } from "./reportColumns.js";

let fontsInitialized = false;
function ensureFontsInitialized() {
  if (fontsInitialized) return;
  pdfMake.setFonts(helveticaFonts);
  pdfMake.setUrlAccessPolicy(() => false);
  // No user-controlled input reaches local file/image paths in this document (only the
  // bundled standard-14 font names), so local access is safe to allow here.
  pdfMake.setLocalAccessPolicy(() => true);
  fontsInitialized = true;
}

const LEDGER_TABLE_LAYOUT: TableLayout = {
  hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1.5 : 0.5),
  vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1.5 : 0.5),
  hLineColor: () => "#000000",
  vLineColor: () => "#000000",
  paddingLeft: () => 2,
  paddingRight: () => 2,
  paddingTop: () => 2,
  paddingBottom: () => 2,
};

const PLAIN_FIELD_WIDTHS: Partial<Record<ReportFieldKey, number>> = {
  name: 90,
  designation: 55,
  contact: 55,
  joiningDate: 45,
  perDayRate: 40,
  gross: 42,
  net: 42,
  advance: 42,
  remaining: 42,
};

const DAY_COLUMN_WIDTH = 16;

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

function buildColumnWidths(fieldKeys: ReportFieldKey[]): number[] {
  const widths: number[] = [];
  for (const key of fieldKeys) {
    if (key === "attendance") {
      widths.push(...Array(31).fill(DAY_COLUMN_WIDTH));
    } else {
      widths.push(PLAIN_FIELD_WIDTHS[key] ?? 45);
    }
  }
  return widths;
}

function buildHeaderRow(fieldKeys: ReportFieldKey[]): ContentCell[] {
  const row: ContentCell[] = [];
  for (const key of fieldKeys) {
    if (key === "attendance") {
      for (let day = 1; day <= 31; day++) {
        row.push({ text: String(day), bold: true, fontSize: 6, alignment: "center" });
      }
    } else {
      row.push({ text: REPORT_FIELD_LABELS[key], bold: true, fontSize: 7, alignment: "center" });
    }
  }
  return row;
}

function attendanceMark(status: "PRESENT" | "HALF" | "ABSENT" | undefined): string {
  if (status === "PRESENT") return "P";
  if (status === "HALF") return "H";
  if (status === "ABSENT") return "A";
  return "";
}

export function buildReportPdfDocDefinition(data: ReportData, fieldKeys: ReportFieldKey[]): TDocumentDefinitions {
  ensureFontsInitialized();

  const widths = buildColumnWidths(fieldKeys);
  const headerRow = buildHeaderRow(fieldKeys);
  const content: unknown[] = [];

  data.months.forEach((section, sectionIndex) => {
    const monthLabel = `${REPORT_MONTH_NAMES[section.month - 1]} ${section.year}`;
    const body: ContentCell[][] = [headerRow];

    for (const worker of data.workers) {
      const totals = worker.monthTotals.get(`${section.year}-${section.month}`);
      const row: ContentCell[] = [];

      for (const key of fieldKeys) {
        if (key === "attendance") {
          for (let day = 1; day <= 31; day++) {
            if (day < section.rangeStartDay || day > section.rangeEndDay || day > section.daysInMonth) {
              row.push({ text: "", fontSize: 6, alignment: "center" });
              continue;
            }
            const dateStr = `${section.year}-${String(section.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            row.push({
              text: attendanceMark(worker.attendanceByDate.get(dateStr)),
              fontSize: 6,
              alignment: "center",
            });
          }
          continue;
        }

        switch (key) {
          case "name":
            row.push({ text: worker.fullName, fontSize: 7 });
            break;
          case "designation":
            row.push({ text: worker.designation, fontSize: 7 });
            break;
          case "contact":
            row.push({ text: worker.contact, fontSize: 7 });
            break;
          case "joiningDate":
            row.push({ text: worker.joiningDate, fontSize: 7, alignment: "center" });
            break;
          case "perDayRate":
            row.push({ text: formatCurrency(worker.perDayRate), fontSize: 7, alignment: "right" });
            break;
          case "gross":
            row.push({ text: formatCurrency(totals?.grossEarned ?? 0), fontSize: 7, alignment: "right" });
            break;
          case "net":
            row.push({ text: formatCurrency(totals?.netEarned ?? 0), fontSize: 7, alignment: "right" });
            break;
          case "advance":
            row.push({ text: formatCurrency(totals?.advanceThisMonth ?? 0), fontSize: 7, alignment: "right" });
            break;
          case "remaining":
            row.push({ text: formatCurrency(totals?.remainingOwed ?? 0), fontSize: 7, alignment: "right" });
            break;
        }
      }

      body.push(row);
    }

    content.push({
      text: `MONTHLY ATTENDANCE REGISTER — ${monthLabel}`,
      fontSize: 13,
      bold: true,
      alignment: "center",
      margin: [0, 0, 0, 10] as [number, number, number, number],
      ...(sectionIndex > 0 ? { pageBreak: "before" as const } : {}),
    });

    content.push({
      table: { headerRows: 1, widths, body },
      layout: LEDGER_TABLE_LAYOUT,
    });
  });

  return {
    pageSize: "A3",
    pageOrientation: "landscape",
    pageMargins: [20, 24, 20, 24],
    defaultStyle: { font: "Helvetica", fontSize: 7 },
    content,
  };
}
