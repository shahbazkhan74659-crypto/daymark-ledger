import { prisma } from "../db.js";
import { dateOnlyToString } from "./date.js";
import { computeSalaryTotals, type SalaryTotals } from "./salary.js";
import { daysInMonth } from "./reportColumns.js";

export interface ReportMonthSection {
  year: number;
  month: number; // 1-12
  daysInMonth: number;
  rangeStartDay: number;
  rangeEndDay: number;
}

export interface ReportWorkerRow {
  id: string;
  fullName: string;
  designation: string;
  contact: string;
  joiningDate: string;
  perDayRate: number;
  attendanceByDate: Map<string, "PRESENT" | "HALF" | "ABSENT">;
  monthTotals: Map<string, SalaryTotals>; // key = `${year}-${month}`
}

export interface ReportData {
  months: ReportMonthSection[];
  workers: ReportWorkerRow[];
}

export function enumerateMonthSections(from: Date, to: Date): ReportMonthSection[] {
  const sections: ReportMonthSection[] = [];
  let year = from.getUTCFullYear();
  let month = from.getUTCMonth() + 1;
  const toYear = to.getUTCFullYear();
  const toMonth = to.getUTCMonth() + 1;

  while (year < toYear || (year === toYear && month <= toMonth)) {
    const monthDays = daysInMonth(year, month);
    const isFirst = year === from.getUTCFullYear() && month === from.getUTCMonth() + 1;
    const isLast = year === toYear && month === toMonth;

    sections.push({
      year,
      month,
      daysInMonth: monthDays,
      rangeStartDay: isFirst ? from.getUTCDate() : 1,
      rangeEndDay: isLast ? to.getUTCDate() : monthDays,
    });

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return sections;
}

function monthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

export async function assembleReportData(workerIds: string[], from: Date, to: Date): Promise<ReportData> {
  const months = enumerateMonthSections(from, to);

  const [workers, attendances, advances, repayments] = await Promise.all([
    prisma.worker.findMany({ where: { id: { in: workerIds } }, orderBy: { fullName: "asc" } }),
    prisma.attendance.findMany({
      where: { workerId: { in: workerIds }, date: { gte: from, lte: to } },
      select: { workerId: true, date: true, status: true },
    }),
    prisma.advance.findMany({
      where: { workerId: { in: workerIds } },
      select: { workerId: true, date: true, amount: true },
    }),
    prisma.advanceRepayment.findMany({
      where: { workerId: { in: workerIds } },
      select: { workerId: true, amount: true },
    }),
  ]);

  const attendanceByWorker = new Map<string, Map<string, "PRESENT" | "HALF" | "ABSENT">>();
  for (const attendance of attendances) {
    if (!attendanceByWorker.has(attendance.workerId)) {
      attendanceByWorker.set(attendance.workerId, new Map());
    }
    attendanceByWorker.get(attendance.workerId)!.set(dateOnlyToString(attendance.date), attendance.status);
  }

  const advancesByWorker = new Map<string, { date: Date; amount: number }[]>();
  for (const advance of advances) {
    if (!advancesByWorker.has(advance.workerId)) {
      advancesByWorker.set(advance.workerId, []);
    }
    advancesByWorker.get(advance.workerId)!.push({ date: advance.date, amount: Number(advance.amount) });
  }

  const repaymentsByWorker = new Map<string, { amount: number }[]>();
  for (const repayment of repayments) {
    if (!repaymentsByWorker.has(repayment.workerId)) {
      repaymentsByWorker.set(repayment.workerId, []);
    }
    repaymentsByWorker.get(repayment.workerId)!.push({ amount: Number(repayment.amount) });
  }

  const rows: ReportWorkerRow[] = workers.map((worker) => {
    const workerAttendanceByDate = attendanceByWorker.get(worker.id) ?? new Map();
    const workerAdvances = advancesByWorker.get(worker.id) ?? [];
    const workerRepayments = repaymentsByWorker.get(worker.id) ?? [];
    const perDayRate = Number(worker.perDayRate);

    const monthTotals = new Map<string, SalaryTotals>();
    for (const section of months) {
      const monthAttendances = [...workerAttendanceByDate.entries()]
        .filter(([dateStr]) => {
          const [y, m] = dateStr.split("-").map(Number);
          return y === section.year && m === section.month;
        })
        .map(([, status]) => ({ status }));

      monthTotals.set(
        monthKey(section.year, section.month),
        computeSalaryTotals(monthAttendances, workerAdvances, workerRepayments, perDayRate, section.year, section.month),
      );
    }

    return {
      id: worker.id,
      fullName: worker.fullName,
      designation: worker.designation,
      contact: worker.contact,
      joiningDate: dateOnlyToString(worker.joiningDate),
      perDayRate,
      attendanceByDate: workerAttendanceByDate,
      monthTotals,
    };
  });

  return { months, workers: rows };
}
