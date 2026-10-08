import { LightbulbIcon } from "lucide-react"

import type { TeamSkillBottleneck } from "@/lib/manager-advisor"

export function TeamStrategicInsight({
  avgProgress,
  atRisk,
  reviewCount,
  completionRate,
  topBottleneck,
  recommendation,
}: {
  avgProgress: number
  atRisk: number
  reviewCount: number
  completionRate: number
  topBottleneck: TeamSkillBottleneck | undefined
  recommendation: string
}) {
  const headline =
    avgProgress >= 80
      ? "Your team is at or above the 80% progress target on average."
      : "Team progress sits below the 80% target — focus on the highest-impact exceptions first."

  const evidence: string[] = []
  if (topBottleneck) {
    evidence.push(
      `${topBottleneck.skill} is the widest shared gap (${topBottleneck.ratePct}% of coachees below target).`,
    )
  }
  if (atRisk > 0) {
    evidence.push(`${atRisk} coachee${atRisk === 1 ? "" : "s"} are behind plan or ended below benchmark.`)
  }
  if (reviewCount > 0) {
    evidence.push(`${reviewCount} report card${reviewCount === 1 ? "" : "s"} await your sign-off.`)
  }
  evidence.push(`${completionRate}% of the team is on track or has completed the cycle.`)
  if (evidence.length === 1) {
    evidence.unshift("No critical shared skill gaps in the current period.")
  }

  return (
    <aside
      className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-[var(--grove-surface-subtle)]/80 px-4 py-4 ring-1 ring-foreground/[0.04]"
      aria-labelledby="team-insight-title"
    >
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card text-forest">
          <LightbulbIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p id="team-insight-title" className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Narrative insight
          </p>
          <p className="mt-1 font-heading text-sm font-medium leading-snug text-foreground">{headline}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {evidence.slice(0, 4).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs">
            <span className="font-medium text-foreground">Recommended focus: </span>
            <span className="text-muted-foreground">{recommendation}</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
