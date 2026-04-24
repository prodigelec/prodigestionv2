import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../generated/prisma/client";

type PrismaClientInstance = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientInstance };

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;