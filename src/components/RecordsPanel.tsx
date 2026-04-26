"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getFlowRecords, type FlowRecordsData, type HeatmapDay } from "@/actions/getFlowRecords";
import { HEATMAP_LEVEL_THRESHOLDS } from "@/constants/app";

function formatDuration(seconds: number): string {
  if (seconds === 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ───────────────────────────────────────────────
// Heatmap
// ───────────────────────────────────────────────

const DAYS_JP = ["日", "月", "火", "水", "木", "金", "土"] as const;

function getLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
  if (seconds === 0) return 0;
  if (seconds < HEATMAP_LEVEL_THRESHOLDS.LOW) return 1;
  if (seconds < HEATMAP_LEVEL_THRESHOLDS.MEDIUM) return 2;
  if (seconds < HEATMAP_LEVEL_THRESHOLDS.HIGH) return 3;
  return 4;
}

function buildWeeks(today: Date): (Date | null)[][] {
  // Start from the Sunday 13 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - 13 * 7);

  const weeks: (Date | null)[][] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const week: (Date | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(cursor);
      cell.setDate(cursor.getDate() + d);
      week.push(cell > today ? null : cell);
    }
    weeks.push(week);
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

const levelColors = [
  "bg-zinc-100",
  "bg-orange-100",
  "bg-orange-300",
  "bg-orange-500",
  "bg-orange-600",
];

function Heatmap({ data }: { data: HeatmapDay[] }) {
  const map = new Map(data.map((d) => [d.date, d.seconds]));
  const today = new Date();
  const weeks = buildWeeks(today);

  // Collect month labels (show when 1st of month appears in a column)
  const monthLabels: Map<number, string> = new Map();
  weeks.forEach((week, col) => {
    for (const cell of week) {
      if (cell && cell.getDate() === 1) {
        monthLabels.set(col, `${cell.getMonth() + 1}月`);
        break;
      }
    }
  });

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      {/* Month labels */}
      <div className="flex gap-[2px] ml-[18px]">
        {weeks.map((_, col) => (
          <div
            key={col}
            className="w-3 shrink-0 text-[8px] leading-none text-zinc-400"
          >
            {monthLabels.get(col) ?? ""}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[2px] shrink-0">
          {DAYS_JP.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-3 text-[8px] leading-none flex items-center text-zinc-400",
                i % 2 === 1 ? "" : "opacity-0",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, col) => (
            <div key={col} className="flex flex-col gap-[2px]">
              {week.map((cell, row) => {
                if (!cell) {
                  return <div key={row} className="w-3 h-3 shrink-0" />;
                }
                const key = toLocalDateKey(cell);
                const seconds = map.get(key) ?? 0;
                const level = getLevel(seconds);
                return (
                  <div
                    key={row}
                    title={`${key}  ${formatDuration(seconds)}`}
                    className={cn(
                      "w-3 h-3 shrink-0 rounded-[2px]",
                      levelColors[level],
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-1 ml-[18px] text-zinc-400">
        <span className="text-[8px]">少</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div
            key={l}
            className={cn("w-3 h-3 rounded-[2px]", levelColors[l as 0 | 1 | 2 | 3 | 4])}
          />
        ))}
        <span className="text-[8px]">多</span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Stat Card
// ───────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-3 bg-zinc-50">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
        {label}
      </span>
      <span className="text-lg font-bold tabular-nums text-zinc-800">
        {value}
      </span>
    </div>
  );
}

// ───────────────────────────────────────────────
// RecordsPanel
// ───────────────────────────────────────────────

export function RecordsPanel() {
  const [data, setData] = useState<FlowRecordsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFlowRecords()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        記録
      </p>

      {error && (
        <p className="text-xs text-zinc-500">読み込みに失敗しました</p>
      )}

      {!data && !error && (
        <p className="text-xs animate-pulse text-zinc-500">読み込み中...</p>
      )}

      {data && (
        <>
          {/* 統計 */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="今日" value={formatDuration(data.todaySeconds)} />
            <StatCard label="今週" value={formatDuration(data.weekSeconds)} />
            <StatCard label="通算" value={formatDuration(data.totalSeconds)} />
          </div>

          <div className="border-t border-zinc-100" />

          {/* 直近の記録 */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-zinc-500">
              直近の記録
            </p>

            {data.records.length === 0 ? (
              <p className="text-xs text-zinc-500">まだ記録がありません</p>
            ) : (
              <ul className="flex flex-col">
                {data.records.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2.5 border-b text-sm border-zinc-100"
                  >
                    <span className="tabular-nums text-zinc-500">
                      {formatDate(r.date)}
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-800">
                      {formatDuration(r.duration)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-zinc-100" />

          {/* ヒートマップ */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
              Activity
            </p>
            <Heatmap data={data.heatmap} />
          </div>
        </>
      )}
    </div>
  );
}
