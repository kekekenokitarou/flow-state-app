"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { MIN_FLOW_DURATION_SECONDS } from "@/constants/app"

const durationSchema = z.number().int().min(MIN_FLOW_DURATION_SECONDS)

export async function saveFlowSession(durationSeconds: number) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const parsed = durationSchema.safeParse(durationSeconds)
  if (!parsed.success) return { skipped: true }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new Error("User not found")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailyWork.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { duration: { increment: parsed.data } },
    create: {
      id: crypto.randomUUID(),
      userId: user.id,
      date: today,
      duration: parsed.data,
    },
  })

  return { saved: true }
}
