import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reusable function to log any action
export const logActivity = async (action: string, message: string) => {
  try {
    await prisma.activity.create({
      data: {
        action,
        message,
        // createdAt is automatic in schema
      },
    });
    console.log(`[LOG]: ${action} - ${message}`);
  } catch (error) {
    console.error("Failed to save activity log:", error);
  }
};