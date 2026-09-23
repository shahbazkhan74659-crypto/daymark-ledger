import { Router } from "express";
import { prisma } from "../db.js";
import { dateOnlyToString, monthDateRange, parseYearMonthQuery } from "../lib/date.js";
import { computeSalaryTotals } from "../lib/salary.js";

export const publicRouter = Router();

publicRouter.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!q) {
    res.json({ status: "ok", workers: [] });
    return;
  }

  try {
    const workers = await prisma.worker.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { contact: q },
          { employeeCode: { equals: q, mode: "insensitive" } },
        ],
      },
      orderBy: { fullName: "asc" },
      select: { id: true, employeeCode: true, fullName: true, designation: true, status: true },
    });

    res.json({ status: "ok", workers });
  } catch (error) {
    console.error("Public worker search failed:", error);
    res.status(500).json({ status: "error", message: "Search failed" });
  }
});

publicRouter.get("/:id/attendance", async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id }, select: { id: true } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const attendance = await prisma.attendance.findMany({
      where: { workerId: id },
      orderBy: { date: "desc" },
      select: { date: true, status: true },
    });

    res.json({
      status: "ok",
      attendance: attendance.map((a) => ({ date: dateOnlyToString(a.date), status: a.status })),
    });
  } catch (error) {
    console.error("Public attendance lookup failed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch attendance" });
  }
});

publicRouter.get("/:id/advances", async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id }, select: { id: true } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const advances = await prisma.advance.findMany({
      where: { workerId: id },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    res.json({
      status: "ok",
      advances: advances.map((a) => ({ date: dateOnlyToString(a.date) })),
    });
  } catch (error) {
    console.error("Public advance lookup failed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch advances" });
  }
});

publicRouter.get("/:id/salary-summary", async (req, res) => {
  const id = String(req.params.id);
  const period = parseYearMonthQuery(req.query as Record<string, unknown>);

  if (!period) {
    res.status(400).json({ status: "error", message: "year and month must both be provided as integers, with month between 1 and 12" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id }, select: { perDayRate: true } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const { start, end } = monthDateRange(period.year, period.month);
    const [attendances, advances, repayments] = await Promise.all([
      prisma.attendance.findMany({
        where: { workerId: id, date: { gte: start, lt: end } },
        select: { status: true },
      }),
      prisma.advance.findMany({ where: { workerId: id }, select: { date: true, amount: true } }),
      prisma.advanceRepayment.findMany({ where: { workerId: id }, select: { amount: true } }),
    ]);

    const totals = computeSalaryTotals(
      attendances,
      advances.map((advance) => ({ date: advance.date, amount: Number(advance.amount) })),
      repayments.map((r) => ({ amount: Number(r.amount) })),
      Number(worker.perDayRate),
      period.year,
      period.month,
    );

    res.json({ status: "ok", netSalary: totals.netEarned, totalAdvance: totals.remainingOwed });
  } catch (error) {
    console.error("Public salary summary failed:", error);
    res.status(500).json({ status: "error", message: "Failed to compute salary summary" });
  }
});
