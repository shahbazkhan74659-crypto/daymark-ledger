// Seeds (or updates) only the single admin account — none of prisma/seed.ts's
// fake sample workers. Safe to run against production, including repeatedly
// (upsert on username, so re-running just resets the password).
//
// Usage: ADMIN_USERNAME=... ADMIN_PASSWORD=... npx tsx scripts/seedAdmin.ts

import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db.js";

const BCRYPT_COST = 12;

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`Seeded admin user "${user.username}" (id: ${user.id}).`);
}

main()
  .catch((error) => {
    console.error("Seeding admin failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
