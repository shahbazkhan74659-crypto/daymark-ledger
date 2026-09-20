import type { AttendanceStatus } from "../types/worker";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type CalendarCell = {
  date: string | null;
  status: AttendanceStatus | null;
  isToday: boolean;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function buildMonthCells(
  year: number,
  month: number,
  attendanceByDate: Map<string, AttendanceStatus>,
  todayStr: string,
): CalendarCell[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstWeekday + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ date: null, status: null, isToday: false });
      continue;
    }
    const date = toDateString(year, month, dayNum);
    cells.push({
      date,
      status: attendanceByDate.get(date) ?? null,
      isToday: date === todayStr,
    });
  }
  return cells;
}

export function todayDateString(): string {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function countMonthStatuses(
  year: number,
  month: number,
  attendanceByDate: Map<string, AttendanceStatus>,
): Record<AttendanceStatus, number> {
  const counts: Record<AttendanceStatus, number> = { PRESENT: 0, HALF: 0, ABSENT: 0 };
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const status = attendanceByDate.get(toDateString(year, month, day));
    if (status) counts[status]++;
  }

  return counts;
}
