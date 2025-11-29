// server/src/server.ts

// 1. Load Environment Variables IMMEDIATELY (Before imports)
import 'dotenv/config'; 

import app from './app';
import { prisma } from './utils/prisma';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 2. Debugging: Print to console to prove it loaded
    // (Do not leave this in production if it contains secrets, but safe for now)
    console.log("🔌 Connecting to Database at:", process.env.DATABASE_URL ? "URL Found" : "URL NOT FOUND");

    // 3. Check Database Connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 4. Start Express Server
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