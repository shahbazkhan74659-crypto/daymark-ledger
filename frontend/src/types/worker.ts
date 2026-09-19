export type AttendanceStatus = "PRESENT" | "HALF" | "ABSENT";

export type Worker = {
  id: string;
  fullName: string;
  todayStatus: AttendanceStatus | null;
};
