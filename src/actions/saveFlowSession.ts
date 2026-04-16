"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const MIN_DURATION_SECONDS = 60

export async function saveFlowSession(durationSeconds: number) {
  if (durationSeconds < MIN_DURATION_SECONDS) return { skipped: true }

  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new Error("User not found")

  await prisma.dailyWork.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      date: new Date(),
      duration: durationSeconds,
    },
  })

  return { saved: true }
}
