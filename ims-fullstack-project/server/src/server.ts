// server/src/server.ts

// 1. Load Environment Variables IMMEDIATELY
import 'dotenv/config'; 

import app from './app';
import { prisma } from './utils/prisma';

const PORT = process.env.PORT || 5000;

// --- AUTO-SEEDER FUNCTION ---
// This ensures your "Recent Activity" widget always has data to show
async function seedInitialActivities() {
  try {
    const count = await prisma.activity.count();
    if (count === 0) {
      console.log('🌱 Activity log is empty. Seeding initial data...');
      await prisma.activity.createMany({
        data: [
          { action: "System Update", message: "System initialized successfully." },
          { action: "Welcome", message: "Welcome to IMS Pro Dashboard." },
          { action: "Setup", message: "Default Administrator account active." },
        ]
      });
      console.log('✅ Initial activities seeded.');
    }
  } catch (error) {
    console.warn('⚠️ Auto-seed failed (Database might not be ready yet).');
  }
}

async function startServer() {
  try {
    // 2. Debugging
    console.log("🔌 Connecting to Database at:", process.env.DATABASE_URL ? "URL Found" : "URL NOT FOUND");

    // 3. Check Database Connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 4. Run Auto-Seeder (Fixes "Empty Dashboard" issue)
    await seedInitialActivities();

    // 5. Start Express Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();