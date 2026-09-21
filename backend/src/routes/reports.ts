import { Router } from "express";
import { prisma } from "../db.js";
import { requireSession } from "../middleware/requireSession.js";
import { dateOnlyToString, parseDateOnly } from "../lib/date.js";
import { assembleReportData } from "../lib/reportData.js";
import { orderedActiveFields, REPORT_FIELD_KEYS } from "../lib/reportColumns.js";
import { buildReportPdfDocDefinition } from "../lib/reportPdf.js";
import { buildReportWorkbook } from "../lib/reportExcel.js";
import pdfMake from "pdfmake";

export const reportsRouter = Router();

type ReportFormat = "PDF" | "EXCEL";

function isReportFormat(value: unknown): value is ReportFormat {
  return value === "PDF" || value === "EXCEL";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

reportsRouter.post("/report", requireSession, async (req, res) => {
  const { format, from, to, fields, workerIds } = req.body ?? {};

  if (!isReportFormat(format)) {
    res.status(400).json({ status: "error", message: "format must be PDF or EXCEL" });
    return;
  }

  const fromDate = typeof from === "string" ? parseDateOnly(from) : null;
  const toDate = typeof to === "string" ? parseDateOnly(to) : null;
  if (!fromDate || !toDate) {
    res.status(400).json({ status: "error", message: "from and to must be valid dates in YYYY-MM-DD format" });
    return;
  }

  if (fromDate > toDate) {
    res.status(400).json({ status: "error", message: "from must not be after to" });
    return;
  }

  if (!Array.isArray(workerIds) || workerIds.length === 0 || !workerIds.every(isNonEmptyString)) {
    res.status(400).json({ status: "error", message: "workerIds must be a non-empty array of worker ids" });
    return;
  }

  const activeFields = orderedActiveFields(fields);
  if (activeFields.length === 0) {
    res.status(400).json({ status: "error", message: "fields must include at least one selected field" });
    return;
  }

  try {
    const matchedWorkers = await prisma.worker.findMany({ where: { id: { in: workerIds } }, select: { id: true } });
    if (matchedWorkers.length === 0) {
      res.status(400).json({ status: "error", message: "No matching employees found for the given workerIds" });
      return;
    }

    const resolvedIds = matchedWorkers.map((w) => w.id);
    const data = await assembleReportData(resolvedIds, fromDate, toDate);
    const fromStr = dateOnlyToString(fromDate);
    const toStr = dateOnlyToString(toDate);

    if (format === "PDF") {
      const docDefinition = buildReportPdfDocDefinition(data, activeFields);
      const buffer = await pdfMake.createPdf(docDefinition).getBuffer();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Attendance_Register_${fromStr}_to_${toStr}.pdf"`);
      res.send(buffer);
    } else {
      const workbook = await buildReportWorkbook(data, activeFields);
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="Attendance_Register_${fromStr}_to_${toStr}.xlsx"`);
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error("Generating report failed:", error);
    res.status(500).json({ status: "error", message: "Failed to generate report" });
  }
});

reportsRouter.get("/report-preferences", requireSession, async (_req, res) => {
  try {
    const preferences = await prisma.reportFieldPreference.findMany({ orderBy: { name: "asc" } });
    res.json({
      status: "ok",
      preferences: preferences.map((p) => ({ id: p.id, name: p.name, fields: p.fields })),
    });
  } catch (error) {
    console.error("Listing report field preferences failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list report field preferences" });
  }
});

reportsRouter.post("/report-preferences", requireSession, async (req, res) => {
  const { name, fields } = req.body ?? {};

  if (!isNonEmptyString(name)) {
    res.status(400).json({ status: "error", message: "name must be a non-empty string" });
    return;
  }

  const activeFields = orderedActiveFields(fields);
  if (activeFields.length === 0) {
    res.status(400).json({ status: "error", message: "fields must include at least one selected field" });
    return;
  }

  const cleanFields: Record<string, boolean> = {};
  for (const key of REPORT_FIELD_KEYS) {
    cleanFields[key] = activeFields.includes(key);
  }

  try {
    const preference = await prisma.reportFieldPreference.create({
      data: { name: name.trim(), fields: cleanFields },
    });
    res.json({ status: "ok", preference: { id: preference.id, name: preference.name, fields: preference.fields } });
  } catch (error) {
    console.error("Creating report field preference failed:", error);
    res.status(500).json({ status: "error", message: "Failed to create report field preference" });
  }
});
