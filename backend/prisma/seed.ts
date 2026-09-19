import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db.js";

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
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
