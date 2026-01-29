import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? process.env.DEV_ADMIN_PASSWORD ?? "admin";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`[seed] admin user already exists: ${username}`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: "ADMIN"
    }
  });

  console.log(`[seed] created admin user: ${username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
