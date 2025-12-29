// Safely import Prisma - handle cases where it's not generated
let PrismaClient: any;
let prismaInstance: any = null;

try {
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  console.warn('Prisma client not available. Run "npx prisma generate" to enable database features.');
  PrismaClient = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Safely initialize Prisma client
if (PrismaClient && process.env.DATABASE_URL) {
  try {
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  } catch (error) {
    console.warn('Prisma client initialization failed:', error);
    prismaInstance = null;
  }
}

// Export a safe prisma client that handles missing database gracefully
export const prisma = prismaInstance;

// Helper function to check if Prisma is available
export function isPrismaAvailable(): boolean {
  return prismaInstance !== null && !!process.env.DATABASE_URL;
}

