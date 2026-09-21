export type ReportFieldKey =
  | "name"
  | "designation"
  | "contact"
  | "joiningDate"
  | "perDayRate"
  | "attendance"
  | "gross"
  | "net"
  | "advance"
  | "remaining";

export const REPORT_FIELD_KEYS: ReportFieldKey[] = [
  "name",
  "designation",
  "contact",
  "joiningDate",
  "perDayRate",
  "attendance",
  "gross",
  "net",
  "advance",
  "remaining",
];

export const REPORT_FIELD_LABELS: Record<ReportFieldKey, string> = {
  name: "Name of Worker",
  designation: "Designation",
  contact: "Contact",
  joiningDate: "Joining Date",
  perDayRate: "Per-Day Rate",
  attendance: "Attendance (P / H / A)",
  gross: "Gross Earned",
  net: "Net Earned",
  advance: "Advance Given",
  remaining: "Remaining Owed",
};

export const REPORT_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isReportFieldKey(value: unknown): value is ReportFieldKey {
  return typeof value === "string" && (REPORT_FIELD_KEYS as string[]).includes(value);
}

export function orderedActiveFields(fields: unknown): ReportFieldKey[] {
  if (typeof fields !== "object" || fields === null) return [];
  const record = fields as Record<string, unknown>;
  return REPORT_FIELD_KEYS.filter((key) => record[key] === true);
}
