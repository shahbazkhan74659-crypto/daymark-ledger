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

function normalizeReason(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

advancesRouter.post("/:id/advances/:date", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const date = parseDateOnly(String(req.params.date));
  const { amount, reason } = req.body ?? {};

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
      res.json({ status: "ok", worker: { id, date: dateOnlyToString(date), amount: null, reason: null } });
      return;
    }

    const normalizedReason = normalizeReason(reason);
    const advance = await prisma.advance.upsert({
      where: { workerId_date: { workerId: id, date } },
      create: { workerId: id, date, amount, reason: normalizedReason },
      update: { amount, reason: normalizedReason },
    });

    res.json({
      status: "ok",
      worker: {
        id,
        date: dateOnlyToString(date),
        amount: Number(advance.amount),
        reason: advance.reason,
      },
    });
  } catch (error) {
    console.error("Updating advance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update advance" });
  }
});

function parsePositiveInt(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

advancesRouter.get("/:id/advances", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const page = parsePositiveInt(req.query.page);
  const limitParam = parsePositiveInt(req.query.limit);
  const paginated = page !== null || limitParam !== null;

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    if (!paginated) {
      const advances = await prisma.advance.findMany({
        where: { workerId: id },
        orderBy: { date: "desc" },
      });

      res.json({
        status: "ok",
        advances: advances.map((advance) => ({
          date: dateOnlyToString(advance.date),
          amount: Number(advance.amount),
          reason: advance.reason,
        })),
      });
      return;
    }

    const effectivePage = page ?? 1;
    const effectiveLimit = Math.min(limitParam ?? 10, 100);

    const [advances, total] = await Promise.all([
      prisma.advance.findMany({
        where: { workerId: id },
        orderBy: { date: "desc" },
        skip: (effectivePage - 1) * effectiveLimit,
        take: effectiveLimit,
      }),
      prisma.advance.count({ where: { workerId: id } }),
    ]);

    res.json({
      status: "ok",
      advances: advances.map((advance) => ({
        date: dateOnlyToString(advance.date),
        amount: Number(advance.amount),
        reason: advance.reason,
      })),
      pagination: {
        page: effectivePage,
        limit: effectiveLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / effectiveLimit)),
      },
    });
  } catch (error) {
    console.error("Listing advances failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list advances" });
  }
});
