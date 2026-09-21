export type ReportFormat = "PDF" | "EXCEL";

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

export const REPORT_FIELD_DEFS: { key: ReportFieldKey; label: string }[] = [
  { key: "name", label: "Name of Worker" },
  { key: "designation", label: "Designation" },
  { key: "contact", label: "Contact" },
  { key: "joiningDate", label: "Joining Date" },
  { key: "perDayRate", label: "Per-Day Rate" },
  { key: "attendance", label: "Attendance (P / H / A)" },
  { key: "gross", label: "Gross Earned" },
  { key: "net", label: "Net Earned" },
  { key: "advance", label: "Advance Given" },
  { key: "remaining", label: "Remaining Owed" },
];

export const DEFAULT_REPORT_FIELDS: Record<ReportFieldKey, boolean> = {
  name: false,
  designation: false,
  contact: false,
  joiningDate: false,
  perDayRate: false,
  attendance: false,
  gross: false,
  net: false,
  advance: false,
  remaining: false,
};

export interface ReportFieldPreference {
  id: string;
  name: string;
  fields: Record<ReportFieldKey, boolean>;
}
