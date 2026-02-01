// server/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Optional: logs Prisma queries to console
});

export default prisma;
