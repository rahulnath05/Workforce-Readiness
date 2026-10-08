import type { ReactNode } from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "cn"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Journey({
  persona,
  steps,
}: {
  persona: string
  steps: { label: string; hint: string; state: "done" | "current" | "later" }[]
}) {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="flex flex-col gap-3 pt-(--card-spacing)">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Current journey · {persona}
        </p>
        <ol className="grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  step.state === "done" && "bg-forest text-white",
                  step.state === "current" && "bg-step text-white",
                  step.state === "later" && "bg-muted text-muted-foreground",
                )}
              >
                {step.state === "done" ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span>
                <span className="block text-sm font-medium">{step.label}</span>
                <span className="block text-xs text-muted-foreground">{step.hint}</span>
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone = "light",
  bars,
  children,
}: {
  label: string
  value: string
  hint: string
  tone?: "light" | "dark"
  bars?: number[]
  children?: ReactNode
}) {
  const dark = tone === "dark"
  return (
    <Card className={cn("rounded-2xl shadow-none", dark && "border-transparent bg-forest-deep text-white")}>
      <CardHeader>
        <CardDescription className={cn(dark && "text-white/70")}>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p className={cn("text-xs", dark ? "text-white/70" : "text-muted-foreground")}>{hint}</p>
        {bars && (
          <div className="flex h-10 items-end gap-1" aria-hidden="true">
            {bars.map((height, index) => (
              <span
                key={index}
                className="w-1.5 rounded-sm bg-white/80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export function MomentumChart() {
  const points = [22, 28, 26, 34, 31, 40, 46, 44, 52, 58, 63, 70]
  const width = 320
  const height = 112
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width
    const y = height - (point / 100) * height
    return [x, y] as const
  })
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full text-forest" role="img" aria-label="Completions over 8 weeks">
      <path d={area} fill="currentColor" opacity="0.12" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={coords.at(-1)?.[0]} cy={coords.at(-1)?.[1]} r="4" fill="currentColor" />
    </svg>
  )
}

export function HeatCell({ level }: { level: number }) {
  const tone = level >= 4 ? "text-white" : "text-forest-deep"
  const shade =
    level <= 1 ? "bg-heat-1" : level === 2 ? "bg-heat-2" : level === 3 ? "bg-heat-3" : level === 4 ? "bg-heat-4" : "bg-heat-5"
  return (
    <span className={cn("inline-flex size-8 items-center justify-center rounded-md text-sm font-medium", shade, tone)}>
      {level}
    </span>
  )
}
