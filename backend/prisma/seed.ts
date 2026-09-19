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
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
