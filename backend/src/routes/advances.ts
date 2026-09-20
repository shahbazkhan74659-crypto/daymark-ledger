import { Router } from "express";
import { prisma } from "../db.js";
import { dateOnlyToString, parseDateOnly } from "../lib/date.js";
import { requireSession } from "../middleware/requireSession.js";

export const advancesRouter = Router();

function isClearAmount(value: unknown): boolean {
  return value === null || value === 0;
}

function isValidAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

advancesRouter.post("/:id/advances/:date", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const date = parseDateOnly(String(req.params.date));
  const { amount } = req.body ?? {};

  if (!date) {
    res.status(400).json({ status: "error", message: "date must be in YYYY-MM-DD format" });
    return;
  }

  if (!isClearAmount(amount) && !isValidAmount(amount)) {
    res.status(400).json({ status: "error", message: "amount must be a positive number, 0, or null" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    if (isClearAmount(amount)) {
      await prisma.advance.deleteMany({ where: { workerId: id, date } });
      res.json({ status: "ok", worker: { id, date: dateOnlyToString(date), amount: null } });
      return;
    }

    const advance = await prisma.advance.upsert({
      where: { workerId_date: { workerId: id, date } },
      create: { workerId: id, date, amount },
      update: { amount },
    });

    res.json({
      status: "ok",
      worker: { id, date: dateOnlyToString(date), amount: Number(advance.amount) },
    });
  } catch (error) {
    console.error("Updating advance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update advance" });
  }
});

advancesRouter.get("/:id/advances", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const advances = await prisma.advance.findMany({
      where: { workerId: id },
      orderBy: { date: "desc" },
    });

    res.json({
      status: "ok",
      advances: advances.map((advance) => ({
        date: dateOnlyToString(advance.date),
        amount: Number(advance.amount),
      })),
    });
  } catch (error) {
    console.error("Listing advances failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list advances" });
  }
});
