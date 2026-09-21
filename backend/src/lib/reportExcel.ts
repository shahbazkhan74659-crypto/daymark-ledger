import ExcelJS from "exceljs";
import type { ReportData } from "./reportData.js";
import { REPORT_FIELD_LABELS, REPORT_MONTH_NAMES, type ReportFieldKey } from "./reportColumns.js";

const PLAIN_FIELD_WIDTHS: Partial<Record<ReportFieldKey, number>> = {
  name: 22,
  designation: 16,
  contact: 16,
  joiningDate: 12,
  perDayRate: 11,
  gross: 11,
  net: 11,
  advance: 11,
  remaining: 12,
};

const DAY_COLUMN_WIDTH = 4;

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

function buildColumns(fieldKeys: ReportFieldKey[]): { header: string; width: number; key: ReportFieldKey | `day${number}` }[] {
  const columns: { header: string; width: number; key: ReportFieldKey | `day${number}` }[] = [];
  for (const key of fieldKeys) {
    if (key === "attendance") {
      for (let day = 1; day <= 31; day++) {
        columns.push({ header: String(day), width: DAY_COLUMN_WIDTH, key: `day${day}` });
      }
    } else {
      columns.push({ header: REPORT_FIELD_LABELS[key], width: PLAIN_FIELD_WIDTHS[key] ?? 12, key });
    }
  }
  return columns;
}

function attendanceMark(status: "PRESENT" | "HALF" | "ABSENT" | undefined): string {
  if (status === "PRESENT") return "P";
  if (status === "HALF") return "H";
  if (status === "ABSENT") return "A";
  return "";
}

export async function buildReportWorkbook(data: ReportData, fieldKeys: ReportFieldKey[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Daymark Ledger";
  workbook.created = new Date();

  for (const section of data.months) {
    const sheetName = `${REPORT_MONTH_NAMES[section.month - 1]} ${section.year}`.slice(0, 31);
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    const columns = buildColumns(fieldKeys);
    worksheet.columns = columns.map((col) => ({ header: col.header, key: col.key, width: col.width }));

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 8 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E5E5" } };
      cell.border = THIN_BORDER;
    });

    for (const worker of data.workers) {
      const totals = worker.monthTotals.get(`${section.year}-${section.month}`);
      const rowValues: Record<string, string | number> = {};

      for (const key of fieldKeys) {
        if (key === "attendance") {
          for (let day = 1; day <= 31; day++) {
            const outOfRange = day < section.rangeStartDay || day > section.rangeEndDay || day > section.daysInMonth;
            const dateStr = `${section.year}-${String(section.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            rowValues[`day${day}`] = outOfRange ? "" : attendanceMark(worker.attendanceByDate.get(dateStr));
          }
          continue;
        }

        switch (key) {
          case "name":
            rowValues.name = worker.fullName;
            break;
          case "designation":
            rowValues.designation = worker.designation;
            break;
          case "contact":
            rowValues.contact = worker.contact;
            break;
          case "joiningDate":
            rowValues.joiningDate = worker.joiningDate;
            break;
          case "perDayRate":
            rowValues.perDayRate = worker.perDayRate;
            break;
          case "gross":
            rowValues.gross = totals?.grossEarned ?? 0;
            break;
          case "net":
            rowValues.net = totals?.netEarned ?? 0;
            break;
          case "advance":
            rowValues.advance = totals?.advanceThisMonth ?? 0;
            break;
          case "remaining":
            rowValues.remaining = totals?.remainingOwed ?? 0;
            break;
        }
      }

      const row = worksheet.addRow(rowValues);
      row.eachCell((cell, colNumber) => {
        cell.border = THIN_BORDER;
        cell.font = { size: 8 };
        const columnKey = columns[colNumber - 1]?.key;
        if (typeof columnKey === "string" && columnKey.startsWith("day")) {
          cell.alignment = { horizontal: "center" };
        } else if (["perDayRate", "gross", "net", "advance", "remaining"].includes(String(columnKey))) {
          cell.numFmt = "0.00";
          cell.alignment = { horizontal: "right" };
        }
      });
    }

    const lastRow = worksheet.rowCount;
    const lastCol = columns.length;
    for (let c = 1; c <= lastCol; c++) {
      const topCell = worksheet.getCell(1, c);
      const bottomCell = worksheet.getCell(lastRow, c);
      topCell.border = { ...topCell.border, top: { style: "medium" } };
      bottomCell.border = { ...bottomCell.border, bottom: { style: "medium" } };
    }
    for (let r = 1; r <= lastRow; r++) {
      const leftCell = worksheet.getCell(r, 1);
      const rightCell = worksheet.getCell(r, lastCol);
      leftCell.border = { ...leftCell.border, left: { style: "medium" } };
      rightCell.border = { ...rightCell.border, right: { style: "medium" } };
    }
  }

  return workbook;
}
