import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db.js";
import { todayDateOnly } from "../src/lib/date.js";

const BCRYPT_COST = 12;

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment to seed the admin account.",
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Seeded admin user "${user.username}" (id: ${user.id}).`);

  const sampleWorkers = [
    { id: "seed-worker-1", fullName: "Ramesh Kumar", designation: "Mason", contact: "9876500001", joiningDate: "2024-01-15", perDayRate: "600.00", status: "ACTIVE" as const },
    { id: "seed-worker-2", fullName: "Suresh Yadav", designation: "Mason Helper", contact: "9876500002", joiningDate: "2024-02-01", perDayRate: "450.00", status: "ACTIVE" as const },
    { id: "seed-worker-3", fullName: "Anil Sharma", designation: "Carpenter", contact: "9876500003", joiningDate: "2024-03-10", perDayRate: "700.00", status: "ACTIVE" as const },
    { id: "seed-worker-4", fullName: "Vikram Singh", designation: "Electrician", contact: "9876500004", joiningDate: "2024-04-05", perDayRate: "750.00", status: "ACTIVE" as const },
    { id: "seed-worker-5", fullName: "Deepak Verma", designation: "Painter", contact: "9876500005", joiningDate: "2024-05-20", perDayRate: "500.00", status: "ACTIVE" as const },
    { id: "seed-worker-6", fullName: "Rajesh Gupta", designation: "Plumber", contact: "9876500006", joiningDate: "2024-06-12", perDayRate: "650.00", status: "ACTIVE" as const },
    { id: "seed-worker-7", fullName: "Mohan Lal", designation: "Laborer", contact: "9876500007", joiningDate: "2024-07-01", perDayRate: "400.00", status: "ACTIVE" as const },
    { id: "seed-worker-8", fullName: "Sanjay Pandey", designation: "Laborer", contact: "9876500008", joiningDate: "2023-11-18", perDayRate: "400.00", status: "INACTIVE" as const },
    { id: "seed-worker-9", fullName: "Ajay Thakur", designation: "Welder", contact: "9876500009", joiningDate: "2024-08-15", perDayRate: "550.00", status: "ACTIVE" as const },
    { id: "seed-worker-10", fullName: "Vinod Chauhan", designation: "Tile Layer", contact: "9876500010", joiningDate: "2024-09-01", perDayRate: "600.00", status: "ACTIVE" as const },
    { id: "seed-worker-11", fullName: "Manoj Tiwari", designation: "Driver", contact: "9876500011", joiningDate: "2024-09-20", perDayRate: "500.00", status: "ACTIVE" as const },
    { id: "seed-worker-12", fullName: "Pramod Joshi", designation: "Security Guard", contact: "9876500012", joiningDate: "2024-10-05", perDayRate: "450.00", status: "ACTIVE" as const },
    { id: "seed-worker-13", fullName: "Naveen Reddy", designation: "Supervisor", contact: "9876500013", joiningDate: "2024-10-18", perDayRate: "800.00", status: "ACTIVE" as const },
    { id: "seed-worker-14", fullName: "Ashok Mishra", designation: "Laborer", contact: "9876500014", joiningDate: "2024-11-02", perDayRate: "400.00", status: "ACTIVE" as const },
    { id: "seed-worker-15", fullName: "Rakesh Yadav", designation: "Mason Helper", contact: "9876500015", joiningDate: "2024-11-15", perDayRate: "450.00", status: "ACTIVE" as const },
    { id: "seed-worker-16", fullName: "Sunil Kumar", designation: "Carpenter Helper", contact: "9876500016", joiningDate: "2024-12-01", perDayRate: "480.00", status: "ACTIVE" as const },
    { id: "seed-worker-17", fullName: "Yogesh Patel", designation: "Painter", contact: "9876500017", joiningDate: "2024-12-10", perDayRate: "500.00", status: "ACTIVE" as const },
    { id: "seed-worker-18", fullName: "Harish Nair", designation: "Laborer", contact: "9876500018", joiningDate: "2023-08-22", perDayRate: "400.00", status: "INACTIVE" as const },
  ];

  for (const worker of sampleWorkers) {
    const { id, joiningDate, ...rest } = worker;
    await prisma.worker.upsert({
      where: { id },
      update: { ...rest, joiningDate: new Date(joiningDate) },
      create: { id, ...rest, joiningDate: new Date(joiningDate) },
    });
  }

  console.log(`Seeded ${sampleWorkers.length} sample workers.`);

  function daysAgo(days: number): Date {
    const today = todayDateOnly();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - days));
  }

  function priorMonthDate(day: number): Date {
    const today = todayDateOnly();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    // In January there's no prior month within the same year; fall back to the
    // current month instead. This only affects the advanceThisMonth figure
    // used to hand-verify salary-summary, and only when seeding in January.
    if (month === 0) {
      return new Date(Date.UTC(year, 0, Math.min(day, 28)));
    }
    return new Date(Date.UTC(year, month - 1, Math.min(day, 28)));
  }

  const attendanceSeed: { workerId: string; date: Date; status: "PRESENT" | "HALF" | "ABSENT" }[] = [
    { workerId: "seed-worker-1", date: daysAgo(1), status: "PRESENT" },
    { workerId: "seed-worker-1", date: daysAgo(2), status: "HALF" },
    { workerId: "seed-worker-1", date: daysAgo(3), status: "ABSENT" },
    { workerId: "seed-worker-2", date: daysAgo(1), status: "PRESENT" },
    { workerId: "seed-worker-2", date: daysAgo(2), status: "PRESENT" },
    { workerId: "seed-worker-2", date: daysAgo(3), status: "HALF" },
  ];

  for (const entry of attendanceSeed) {
    await prisma.attendance.upsert({
      where: { workerId_date: { workerId: entry.workerId, date: entry.date } },
      update: { status: entry.status },
      create: entry,
    });
  }

  console.log(`Seeded ${attendanceSeed.length} sample attendance records.`);

  const advanceSeed: { workerId: string; date: Date; amount: string }[] = [
    { workerId: "seed-worker-1", date: daysAgo(2), amount: "200.00" },
    { workerId: "seed-worker-1", date: priorMonthDate(10), amount: "150.00" },
    { workerId: "seed-worker-2", date: daysAgo(1), amount: "100.00" },
  ];

  for (const entry of advanceSeed) {
    await prisma.advance.upsert({
      where: { workerId_date: { workerId: entry.workerId, date: entry.date } },
      update: { amount: entry.amount },
      create: entry,
    });
  }

  console.log(`Seeded ${advanceSeed.length} sample advance records.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
