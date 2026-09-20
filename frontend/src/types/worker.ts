export type AttendanceStatus = "PRESENT" | "HALF" | "ABSENT";

export type Worker = {
  id: string;
  fullName: string;
  todayStatus: AttendanceStatus | null;
};

export type WorkerDetail = {
  id: string;
  fullName: string;
  designation: string;
  perDayRate: number;
  status: "ACTIVE" | "INACTIVE";
};

export type AttendanceRecord = {
  date: string;
  status: AttendanceStatus;
};

export type Advance = {
  date: string;
  amount: number;
};

export type SalaryTotals = {
  grossEarned: number;
  netEarned: number;
  advanceThisMonth: number;
  advanceThisYear: number;
  remainingOwed: number;
};
