// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  const roles = [
    { name: 'super_admin',   displayName: 'Super Admin' },
    { name: 'admin',         displayName: 'Admin' },
    { name: 'teacher',       displayName: 'Teacher' },
    { name: 'administrator', displayName: 'Administrator' },
    { name: 'librarian',     displayName: 'Librarian' },
    { name: 'finance',       displayName: 'Finance Manager' },
  ];

  for (const role of roles) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name }, // Look for this name
      update: {},                 // If found, do nothing
      create: {                   // If not found, create it
        name: role.name,
        displayName: role.displayName,
      },
    });
    console.log(`✅ Role ensured: ${upsertedRole.displayName}`);
  }

  console.log('✨ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });