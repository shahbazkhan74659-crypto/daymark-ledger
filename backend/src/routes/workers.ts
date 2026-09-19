import { Router } from "express";
import { prisma } from "../db.js";
import { todayDateOnly } from "../lib/date.js";
import { requireSession } from "../middleware/requireSession.js";

export const workersRouter = Router();

const ATTENDANCE_STATUSES = ["PRESENT", "HALF", "ABSENT"] as const;
type AttendanceStatusInput = (typeof ATTENDANCE_STATUSES)[number];

function isAttendanceStatus(value: unknown): value is AttendanceStatusInput {
  return typeof value === "string" && (ATTENDANCE_STATUSES as readonly string[]).includes(value);
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

    if (status === null) {
      await prisma.attendance.deleteMany({ where: { workerId: id, date: today } });
      res.json({ status: "ok", worker: { id, todayStatus: null } });
      return;
    }

    const attendance = await prisma.attendance.upsert({
      where: { workerId_date: { workerId: id, date: today } },
      create: { workerId: id, date: today, status },
      update: { status },
    });

    res.json({ status: "ok", worker: { id, todayStatus: attendance.status } });
  } catch (error) {
    console.error("Updating today's attendance failed:", error);
    res.status(500).json({ status: "error", message: "Failed to update attendance" });
  }
});
