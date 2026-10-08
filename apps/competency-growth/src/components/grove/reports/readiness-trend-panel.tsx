import { TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const WEEKS = ["W1", "W4", "W8", "W12"]

function buildSeries(endValue: number): number[] {
  const start = Math.max(15, Math.round(endValue * 0.55))
  const mid = Math.round((start + endValue) / 2)
  return [start, Math.round(start * 1.08), mid, Math.round(mid * 1.05), endValue]
}

export function ReadinessTrendPanel({ currentReadiness }: { currentReadiness: number | null }) {
  const end = currentReadiness ?? 70
  const points = buildSeries(end)
  const start = points[0]
  const delta = end - start
  const width = 340
  const height = 140
  const padding = { top: 12, right: 8, bottom: 28, left: 8 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const coords = points.map((point, index) => {
    const x = padding.left + (index / (points.length - 1)) * innerW
    const y = padding.top + innerH - (point / 100) * innerH
    return [x, y, point] as const
  })

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const area = `${line} L${coords.at(-1)?.[0]},${padding.top + innerH} L${coords[0][0]},${padding.top + innerH} Z`
  const last = coords.at(-1)

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-forest/10">
      <CardHeader className="flex shrink-0 flex-row items-start justify-between gap-2 border-b border-border/50 bg-gradient-to-r from-[var(--grove-positive-soft)]/50 to-transparent pb-3">
        <div>
          <CardTitle className="font-heading text-base">Readiness momentum</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">12-week roll-up vs benchmarks</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-forest/10 px-2.5 py-1 text-xs font-semibold text-forest">
          <TrendingUpIcon className="size-3.5" aria-hidden />
          <span className="tabular-nums">+{delta} pts</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pt-4">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-forest">{end}%</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-2 w-full text-forest"
          role="img"
          aria-label={`Readiness trend from ${start}% to ${end}% over twelve weeks`}
        >
          {[25, 50, 75].map((tick) => {
            const y = padding.top + innerH - (tick / 100) * innerH
            return (
              <line
                key={tick}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
              />
            )
          })}
          <defs>
            <linearGradient id="readinessTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#readinessTrendFill)" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {coords.slice(0, -1).map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--card)" stroke="currentColor" strokeWidth="2" />
          ))}
          {last && (
            <>
              <circle cx={last[0]} cy={last[1]} r="6" fill="currentColor" opacity={0.2} />
              <circle cx={last[0]} cy={last[1]} r="4" fill="currentColor" />
            </>
          )}
          {WEEKS.map((label, i) => {
            const x = padding.left + (i / (WEEKS.length - 1)) * innerW
            return (
              <text
                key={label}
                x={x}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {label}
              </text>
            )
          })}
        </svg>
        <p className={cn("mt-2 text-center text-[11px] text-muted-foreground")}>
          Trajectory if current benchmark coverage holds
        </p>
      </CardContent>
    </Card>
  )
}
