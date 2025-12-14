import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding fake activities...");

  await prisma.activity.createMany({
    data: [
      { action: "System Update", message: "System updated to version 2.1" },
      { action: "New Admission", message: "Student John Doe admitted to Class 10-A" },
      { action: "Fee Payment", message: "Tuition fee received from Sarah Smith ($500)" },
      { action: "Exam Created", message: "Mid-Term Mathematics exam scheduled" },
      { action: "Library", message: "Book 'Physics Vol 1' issued to Alex Brown" },
      { action: "User Login", message: "Admin logged in from new device" },
    ]
  });

  console.log("Seeding complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());