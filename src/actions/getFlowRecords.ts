"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HEATMAP_DAYS, RECENT_RECORDS_LIMIT } from "@/constants/app"

export interface FlowRecord {
  id: string
  date: string
  duration: number
}

export interface HeatmapDay {
  date: string   // "YYYY-MM-DD" local
  seconds: number
}

export interface FlowRecordsData {
  todaySeconds: number
  weekSeconds: number
  totalSeconds: number
  records: FlowRecord[]
  heatmap: HeatmapDay[]
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export async function getFlowRecords(): Promise<FlowRecordsData> {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new Error("User not found")

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - todayStart.getDay())

  const heatmapStart = new Date(todayStart)
  heatmapStart.setDate(todayStart.getDate() - (HEATMAP_DAYS - 1))

  const [records, todayAgg, weekAgg, totalAgg, heatmapRecords] = await Promise.all([
    prisma.dailyWork.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: RECENT_RECORDS_LIMIT,
      select: { id: true, date: true, duration: true },
    }),
    prisma.dailyWork.aggregate({
      where: { userId: user.id, date: { gte: todayStart } },
      _sum: { duration: true },
    }),
    prisma.dailyWork.aggregate({
      where: { userId: user.id, date: { gte: weekStart } },
      _sum: { duration: true },
    }),
    prisma.dailyWork.aggregate({
      where: { userId: user.id },
      _sum: { duration: true },
    }),
    prisma.dailyWork.findMany({
      where: { userId: user.id, date: { gte: heatmapStart } },
      select: { date: true, duration: true },
    }),
  ])

  return {
    todaySeconds: todayAgg._sum.duration ?? 0,
    weekSeconds: weekAgg._sum.duration ?? 0,
    totalSeconds: totalAgg._sum.duration ?? 0,
    records: records.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      duration: r.duration,
    })),
    heatmap: heatmapRecords.map((r) => ({
      date: toLocalDateKey(r.date),
      seconds: r.duration,
    })),
  }
}
