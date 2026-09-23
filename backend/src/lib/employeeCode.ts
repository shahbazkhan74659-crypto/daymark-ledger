import { prisma } from "../db.js";

export async function generateNextEmployeeCode(): Promise<string> {
  const last = await prisma.worker.findFirst({
    select: { employeeCode: true },
    orderBy: { employeeCode: "desc" },
  });

  const lastNumber = last ? Number.parseInt(last.employeeCode.replace("EMP-", ""), 10) : 0;
  const nextNumber = (Number.isFinite(lastNumber) ? lastNumber : 0) + 1;

  return `EMP-${String(nextNumber).padStart(4, "0")}`;
}
