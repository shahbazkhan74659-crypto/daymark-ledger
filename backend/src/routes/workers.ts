import fs from "node:fs";
import { Router } from "express";
import { prisma } from "../db.js";
import { computeSalaryTotals } from "../lib/salary.js";
import { dateOnlyToString, monthDateRange, parseDateOnly, parseYearMonthQuery, todayDateOnly } from "../lib/date.js";
import { requireSession } from "../middleware/requireSession.js";
import { workerUploadDir } from "../lib/storage.js";
import { generateNextEmployeeCode } from "../lib/employeeCode.js";

export const workersRouter = Router();

const ATTENDANCE_STATUSES = ["PRESENT", "HALF", "ABSENT"] as const;
type AttendanceStatusInput = (typeof ATTENDANCE_STATUSES)[number];

function isAttendanceStatus(value: unknown): value is AttendanceStatusInput {
  return typeof value === "string" && (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function setAttendanceForDate(
  workerId: string,
  date: Date,
  status: AttendanceStatusInput | null,
): Promise<AttendanceStatusInput | null> {
  if (status === null) {
    await prisma.attendance.deleteMany({ where: { workerId, date } });
    return null;
  }

  const attendance = await prisma.attendance.upsert({
    where: { workerId_date: { workerId, date } },
    create: { workerId, date, status },
    update: { status },
  });

  return attendance.status;
}

workersRouter.get("/", requireSession, async (_req, res) => {
  try {
    const today = todayDateOnly();
    const workers = await prisma.worker.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        attendances: { where: { date: today }, select: { status: true } },
      },
    });

    res.json({
      status: "ok",
      workers: workers.map((worker) => ({
        id: worker.id,
        fullName: worker.fullName,
        todayStatus: worker.attendances[0]?.status ?? null,
      })),
    });
  } catch (error) {
    console.error("Listing workers failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list workers" });
  }
});

workersRouter.post("/", requireSession, async (req, res) => {
  const { fullName, designation, contact, joiningDate: joiningDateInput, perDayRate } = req.body ?? {};

  if (!isNonEmptyString(fullName)) {
    res.status(400).json({ status: "error", message: "fullName must be a non-empty string" });
    return;
  }

  if (!isNonEmptyString(designation)) {
    res.status(400).json({ status: "error", message: "designation must be a non-empty string" });
    return;
  }

  if (!isNonEmptyString(contact)) {
    res.status(400).json({ status: "error", message: "contact must be a non-empty string" });
    return;
  }

  const joiningDate = typeof joiningDateInput === "string" ? parseDateOnly(joiningDateInput) : null;
  if (!joiningDate) {
    res.status(400).json({ status: "error", message: "joiningDate must be in YYYY-MM-DD format" });
    return;
  }

  if (!isValidRate(perDayRate)) {
    res.status(400).json({ status: "error", message: "perDayRate must be a positive number" });
    return;
  }

  try {
    const employeeCode = await generateNextEmployeeCode();
    const worker = await prisma.worker.create({
      data: { employeeCode, fullName, designation, contact, joiningDate, perDayRate, status: "ACTIVE" },
    });

    res.json({
      status: "ok",
      worker: {
        id: worker.id,
        employeeCode: worker.employeeCode,
        fullName: worker.fullName,
        designation: worker.designation,
        contact: worker.contact,
        joiningDate: dateOnlyToString(worker.joiningDate),
        perDayRate: Number(worker.perDayRate),
        status: worker.status,
      },
    });
  } catch (error) {
    console.error("Creating worker failed:", error);
    res.status(500).json({ status: "error", message: "Failed to create worker" });
  }
});

workersRouter.get("/all", requireSession, async (_req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, designation: true, status: true },
    });

    res.json({
      status: "ok",
      workers: workers.map((worker) => ({
        id: worker.id,
        fullName: worker.fullName,
        designation: worker.designation,
        status: worker.status,
      })),
    });
  } catch (error) {
    console.error("Listing all workers failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list workers" });
  }
});

workersRouter.get("/:id", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    res.json({
      status: "ok",
      worker: {
        id: worker.id,
        employeeCode: worker.employeeCode,
        fullName: worker.fullName,
        designation: worker.designation,
        contact: worker.contact,
        joiningDate: dateOnlyToString(worker.joiningDate),
        perDayRate: Number(worker.perDayRate),
        status: worker.status,
      },
    });
  } catch (error) {
    console.error("Fetching worker failed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch worker" });
  }
});

workersRouter.post("/:id", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const { fullName, designation, contact, joiningDate: joiningDateInput } = req.body ?? {};

  if (!isNonEmptyString(fullName)) {
    res.status(400).json({ status: "error", message: "fullName must be a non-empty string" });
    return;
  }

  if (!isNonEmptyString(designation)) {
    res.status(400).json({ status: "error", message: "designation must be a non-empty string" });
    return;
  }

  if (!isNonEmptyString(contact)) {
    res.status(400).json({ status: "error", message: "contact must be a non-empty string" });
    return;
  }

  const joiningDate = typeof joiningDateInput === "string" ? parseDateOnly(joiningDateInput) : null;
  if (!joiningDate) {
    res.status(400).json({ status: "error", message: "joiningDate must be in YYYY-MM-DD format" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const updated = await prisma.worker.update({
      where: { id },
      data: { fullName, designation, contact, joiningDate },
    });

    res.json({
      status: "ok",
      worker: {
        id: updated.id,
        employeeCode: updated.employeeCode,
        fullName: updated.fullName,
        designation: updated.designation,
        contact: updated.contact,
        joiningDate: dateOnlyToString(updated.joiningDate),
        perDayRate: Number(updated.perDayRate),
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Updating worker failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update worker" });
  }
});

const WORKER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
type WorkerStatusInput = (typeof WORKER_STATUSES)[number];

function isWorkerStatus(value: unknown): value is WorkerStatusInput {
  return typeof value === "string" && (WORKER_STATUSES as readonly string[]).includes(value);
}

workersRouter.post("/:id/status", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body ?? {};

  if (!isWorkerStatus(status)) {
    res.status(400).json({ status: "error", message: "status must be ACTIVE or INACTIVE" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const updated = await prisma.worker.update({ where: { id }, data: { status } });
    res.json({ status: "ok", worker: { id: updated.id, status: updated.status } });
  } catch (error) {
    console.error("Updating worker status failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update worker status" });
  }
});

workersRouter.post("/:id/delete", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    if (worker.status !== "INACTIVE") {
      res.status(400).json({ status: "error", message: "Only inactive workers can be deleted" });
      return;
    }

    // Cascades Attendance/Advance/WorkerDocument rows via the schema's onDelete: Cascade —
    // the uploaded files themselves live on disk and aren't touched by that cascade.
    await prisma.worker.delete({ where: { id } });

    fs.rm(workerUploadDir(id), { recursive: true, force: true }, (err) => {
      if (err) console.error(`Failed to remove upload directory for deleted worker ${id}:`, err);
    });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Deleting worker failed:", error);
    res.status(500).json({ status: "error", message: "Failed to delete worker" });
  }
});

workersRouter.post("/:id/attendance/today", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body ?? {};

  if (status !== null && !isAttendanceStatus(status)) {
    res.status(400).json({ status: "error", message: "status must be one of PRESENT, HALF, ABSENT, or null" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const today = todayDateOnly();
    const result = await setAttendanceForDate(id, today, status);
    res.json({ status: "ok", worker: { id, todayStatus: result } });
  } catch (error) {
    console.error("Updating today's attendance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update attendance" });
  }
});

workersRouter.get("/:id/attendance/:date", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const date = parseDateOnly(String(req.params.date));

  if (!date) {
    res.status(400).json({ status: "error", message: "date must be in YYYY-MM-DD format" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const attendance = await prisma.attendance.findUnique({
      where: { workerId_date: { workerId: id, date } },
    });

    res.json({
      status: "ok",
      worker: { id, date: dateOnlyToString(date), status: attendance?.status ?? null },
    });
  } catch (error) {
    console.error("Fetching attendance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch attendance" });
  }
});

workersRouter.post("/:id/attendance/:date", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const date = parseDateOnly(String(req.params.date));
  const { status } = req.body ?? {};

  if (!date) {
    res.status(400).json({ status: "error", message: "date must be in YYYY-MM-DD format" });
    return;
  }

  if (status !== null && !isAttendanceStatus(status)) {
    res.status(400).json({ status: "error", message: "status must be one of PRESENT, HALF, ABSENT, or null" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const result = await setAttendanceForDate(id, date, status);
    res.json({ status: "ok", worker: { id, date: dateOnlyToString(date), status: result } });
  } catch (error) {
    console.error("Updating attendance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update attendance" });
  }
});

workersRouter.get("/:id/attendance", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const attendance = await prisma.attendance.findMany({
      where: { workerId: id },
      orderBy: { date: "desc" },
    });

    res.json({
      status: "ok",
      attendance: attendance.map((a) => ({ date: dateOnlyToString(a.date), status: a.status })),
    });
  } catch (error) {
    console.error("Listing attendance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list attendance" });
  }
});

workersRouter.get("/:id/salary-summary", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const period = parseYearMonthQuery(req.query as Record<string, unknown>);

  if (!period) {
    res.status(400).json({ status: "error", message: "year and month must both be provided as integers, with month between 1 and 12" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
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

    res.json({ status: "ok", worker: { id, ...totals } });
  } catch (error) {
    console.error("Computing salary summary failed:", error);
    res.status(500).json({ status: "error", message: "Failed to compute salary summary" });
  }
});

function isValidRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

workersRouter.post("/:id/rate", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const { perDayRate } = req.body ?? {};

  if (!isValidRate(perDayRate)) {
    res.status(400).json({ status: "error", message: "perDayRate must be a positive number" });
    return;
  }

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const updated = await prisma.worker.update({ where: { id }, data: { perDayRate } });
    res.json({ status: "ok", worker: { id, perDayRate: Number(updated.perDayRate) } });
  } catch (error) {
    console.error("Updating rate failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update rate" });
  }
});
