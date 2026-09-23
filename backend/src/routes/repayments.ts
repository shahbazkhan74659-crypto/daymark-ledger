import { Router } from "express";
import { prisma } from "../db.js";
import { computeAdvanceOverview } from "../lib/repayment.js";
import { dateOnlyToString, todayDateOnly } from "../lib/date.js";
import { requireSession } from "../middleware/requireSession.js";

export const repaymentsRouter = Router();

const REPAYMENT_BUCKETS = ["MONTH", "YEAR"] as const;
type RepaymentBucketInput = (typeof REPAYMENT_BUCKETS)[number];

function isRepaymentBucket(value: unknown): value is RepaymentBucketInput {
  return typeof value === "string" && (REPAYMENT_BUCKETS as readonly string[]).includes(value);
}

function isValidAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

async function loadOverviewData(workerId: string) {
  const [advances, monthRepayments, yearRepayments] = await Promise.all([
    prisma.advance.findMany({ where: { workerId }, select: { date: true, amount: true } }),
    prisma.advanceRepayment.findMany({ where: { workerId, bucket: "MONTH" }, select: { amount: true } }),
    prisma.advanceRepayment.findMany({ where: { workerId, bucket: "YEAR" }, select: { amount: true } }),
  ]);
  const today = todayDateOnly();
  return computeAdvanceOverview(
    advances.map((a) => ({ date: a.date, amount: Number(a.amount) })),
    monthRepayments.map((r) => ({ amount: Number(r.amount) })),
    yearRepayments.map((r) => ({ amount: Number(r.amount) })),
    today.getUTCFullYear(),
    today.getUTCMonth() + 1,
  );
}

repaymentsRouter.get("/:id/advance-overview", requireSession, async (req, res) => {
  const id = String(req.params.id);
  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }
    const overview = await loadOverviewData(id);
    res.json({ status: "ok", worker: { id, ...overview } });
  } catch (error) {
    console.error("Computing advance overview failed:", error);
    res.status(500).json({ status: "error", message: "Failed to compute advance overview" });
  }
});

repaymentsRouter.get("/:id/repayments/:bucket", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const bucketParam = String(req.params.bucket);

  if (!isRepaymentBucket(bucketParam)) {
    res.status(400).json({ status: "error", message: "bucket must be MONTH or YEAR" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const repayments = await prisma.advanceRepayment.findMany({
      where: { workerId: id, bucket: bucketParam },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    res.json({
      status: "ok",
      repayments: repayments.map((r) => ({
        id: r.id,
        date: dateOnlyToString(r.date),
        amount: Number(r.amount),
      })),
    });
  } catch (error) {
    console.error("Listing repayments failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list repayments" });
  }
});

repaymentsRouter.post("/:id/repayments", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const { bucket, amount } = req.body ?? {};

  if (!isRepaymentBucket(bucket)) {
    res.status(400).json({ status: "error", message: "bucket must be MONTH or YEAR" });
    return;
  }
  if (!isValidAmount(amount)) {
    res.status(400).json({ status: "error", message: "amount must be a positive number" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const overview = await loadOverviewData(id);
    const outstanding = bucket === "MONTH" ? overview.month.outstanding : overview.year.outstanding;

    if (Math.round(amount * 100) / 100 > outstanding) {
      res.status(400).json({ status: "error", message: "Repayment exceeds outstanding balance for this bucket" });
      return;
    }

    const repayment = await prisma.advanceRepayment.create({
      data: { workerId: id, bucket, date: todayDateOnly(), amount },
    });

    const updatedOverview = await loadOverviewData(id);

    res.json({
      status: "ok",
      repayment: { id: repayment.id, date: dateOnlyToString(repayment.date), amount: Number(repayment.amount), bucket: repayment.bucket },
      overview: { id, ...updatedOverview },
    });
  } catch (error) {
    console.error("Creating repayment failed:", error);
    res.status(500).json({ status: "error", message: "Failed to create repayment" });
  }
});
