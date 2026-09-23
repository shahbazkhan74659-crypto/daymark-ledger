export type AttendanceStatus = "PRESENT" | "HALF" | "ABSENT";
export type WorkerStatus = "ACTIVE" | "INACTIVE";

export type Worker = {
  id: string;
  fullName: string;
  todayStatus: AttendanceStatus | null;
};

export type WorkerDetail = {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  contact: string;
  joiningDate: string;
  perDayRate: number;
  status: WorkerStatus;
};

export type PublicWorker = {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  status: WorkerStatus;
};

export type PublicAdvanceDate = {
  date: string;
};

export type ManageWorker = {
  id: string;
  fullName: string;
  designation: string;
  status: WorkerStatus;
};

export type WorkerDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type AttendanceRecord = {
  date: string;
  status: AttendanceStatus;
};

export type Advance = {
  date: string;
  amount: number;
  reason: string | null;
};

export type AdvancePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedAdvances = {
  advances: Advance[];
  pagination: AdvancePagination;
};

export type SalaryTotals = {
  grossEarned: number;
  netEarned: number;
  advanceThisMonth: number;
  advanceThisYear: number;
  remainingOwed: number;
};

export type CreateWorkerInput = {
  fullName: string;
  designation: string;
  contact: string;
  joiningDate: string;
  perDayRate: number;
};

export type CreatedWorker = CreateWorkerInput & { id: string; status: WorkerStatus };

export type RepaymentBucket = "MONTH" | "YEAR";

export type BucketOverview = {
  advanceTaken: number;
  repaid: number;
  outstanding: number;
};

export type AdvanceOverview = {
  totalAdvance: number;
  month: BucketOverview;
  year: BucketOverview;
};

export type Repayment = {
  id: string;
  date: string;
  amount: number;
};
