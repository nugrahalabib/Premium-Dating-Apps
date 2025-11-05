// src/utils/prisma.ts
import { PrismaClient } from '../generated/prisma';

// Use a singleton to prevent connection pool exhaustion.
const prisma = new PrismaClient();

export default prisma;
