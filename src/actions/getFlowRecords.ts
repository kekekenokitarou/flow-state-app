"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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

  // Heatmap: past 14 weeks (98 days)
  const heatmapStart = new Date(todayStart)
  heatmapStart.setDate(todayStart.getDate() - 97)

  const [records, todayAgg, weekAgg, totalAgg, heatmapRecords] = await Promise.all([
    prisma.dailyWork.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
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

  // Aggregate heatmap records by local date
  const dayMap = new Map<string, number>()
  for (const r of heatmapRecords) {
    const key = toLocalDateKey(r.date)
    dayMap.set(key, (dayMap.get(key) ?? 0) + r.duration)
  }

  return {
    todaySeconds: todayAgg._sum.duration ?? 0,
    weekSeconds: weekAgg._sum.duration ?? 0,
    totalSeconds: totalAgg._sum.duration ?? 0,
    records: records.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      duration: r.duration,
    })),
    heatmap: Array.from(dayMap.entries()).map(([date, seconds]) => ({ date, seconds })),
  }
}
