import { LightbulbIcon } from "lucide-react"

import type { RoleLevel } from "@/domain/types"

export function ReportsStrategicInsight({
  readiness,
  atRiskTotal,
  weakestDesignation,
  weakestPct,
  reviewCount,
}: {
  readiness: number | null
  atRiskTotal: number
  weakestDesignation: RoleLevel | null
  weakestPct: number | null
  reviewCount: number
}) {
  const headline =
    readiness !== null && readiness >= 80
      ? "Portfolio is at or above the 80% readiness target."
      : readiness !== null
        ? "Readiness remains below the 80% target — prioritize the weakest role band and largest at-risk cohorts."
        : "Publish benchmarks to establish a readiness baseline for this scope."

  const evidence: string[] = []
  if (weakestDesignation && weakestPct !== null) {
    evidence.push(`${weakestDesignation} trails other bands at ${weakestPct}% weighted readiness.`)
  }
  if (atRiskTotal > 0) {
    evidence.push(`${atRiskTotal} learners are behind plan across in-scope profiles.`)
  }
  if (reviewCount > 0) {
    evidence.push(`${reviewCount} report card${reviewCount === 1 ? "" : "s"} need leader sign-off before quarter close.`)
  }
  if (!evidence.length) {
    evidence.push("No critical exceptions in the current filters.")
  }

  const decision =
    atRiskTotal > 0 && weakestDesignation
      ? `Drill into ${weakestDesignation} cohorts and confirm remediation owners this week.`
      : reviewCount > 0
        ? "Clear the sign-off queue to lock outcomes for export."
        : "Maintain coverage on published benchmarks and monitor weekly."

  return (
    <aside
      className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-[var(--grove-surface-subtle)]/80 px-4 py-4 ring-1 ring-foreground/[0.04]"
      aria-labelledby="strategic-insight-title"
    >
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card text-forest">
          <LightbulbIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p id="strategic-insight-title" className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Narrative insight
          </p>
          <p className="mt-1 font-heading text-sm font-medium leading-snug text-foreground">{headline}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {evidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs">
            <span className="font-medium text-foreground">Recommended focus: </span>
            <span className="text-muted-foreground">{decision}</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
