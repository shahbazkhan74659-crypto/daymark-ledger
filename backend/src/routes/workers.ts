import { Router } from "express";
import { prisma } from "../db.js";
import { computeSalaryTotals } from "../lib/salary.js";
import { dateOnlyToString, parseDateOnly, todayDateOnly } from "../lib/date.js";
import { requireSession } from "../middleware/requireSession.js";

export const workersRouter = Router();

const ATTENDANCE_STATUSES = ["PRESENT", "HALF", "ABSENT"] as const;
type AttendanceStatusInput = (typeof ATTENDANCE_STATUSES)[number];

function isAttendanceStatus(value: unknown): value is AttendanceStatusInput {
  return typeof value === "string" && (ATTENDANCE_STATUSES as readonly string[]).includes(value);
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
      include: { attendances: { where: { date: today } } },
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

workersRouter.get("/:id/salary-summary", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const [attendances, advances] = await Promise.all([
      prisma.attendance.findMany({ where: { workerId: id }, select: { status: true } }),
      prisma.advance.findMany({ where: { workerId: id }, select: { date: true, amount: true } }),
    ]);

    const totals = computeSalaryTotals(
      attendances,
      advances.map((advance) => ({ date: advance.date, amount: Number(advance.amount) })),
      Number(worker.perDayRate),
    );

    res.json({ status: "ok", worker: { id, ...totals } });
  } catch (error) {
    console.error("Computing salary summary failed:", error);
    res.status(500).json({ status: "error", message: "Failed to compute salary summary" });
  }
});
