import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"
import { env } from "@/lib/env"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaNeonHttp(env.DATABASE_URL, {})
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma
