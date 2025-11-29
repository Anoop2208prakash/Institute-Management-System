import { PrismaClient } from '@prisma/client';

// 1. Add prisma to the global type definition
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Use existing instance if available, or create new one
export const prisma = globalForPrisma.prisma || new PrismaClient();

// 3. Save instance in development to prevent connection exhaustion
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;