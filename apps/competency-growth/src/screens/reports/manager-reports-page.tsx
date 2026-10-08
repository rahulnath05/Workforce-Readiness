import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { ReviewQueuePanel } from "@/components/grove/reports/review-queue-panel"
import {
  TeamReportsScopeBar,
  type TeamStatusFilter,
} from "@/components/grove/reports/team-reports-scope-bar"
import { TeamOutcomeHero } from "@/components/grove/reports/team-outcome-hero"
import { TeamStrategicInsight } from "@/components/grove/reports/team-strategic-insight"
import { TeamProgressChart } from "@/components/grove/reports/team-progress-chart"
import { TeamExceptionList } from "@/components/grove/reports/team-exception-list"
import { awaitingReviews, verdictMix } from "@/domain/report-aggregates"
import { teamSummaryStats } from "@/domain/selectors"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import { summarizeTeam, teamAnalytics } from "@/lib/manager-advisor"

export function ManagerReportsPage() {
  const navigate = useNavigate()
  const { directReports, reportCards, benchmarkVersions } = useWorkspace()
  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === "all") return directReports
    return directReports.filter((p) => p.status === statusFilter)
  }, [directReports, statusFilter])

  const stats = useMemo(() => teamSummaryStats(filtered, reportCards), [filtered, reportCards])
  const fullStats = useMemo(() => teamSummaryStats(directReports, reportCards), [directReports, reportCards])
  const analytics = useMemo(() => teamAnalytics(filtered, stats), [filtered, stats])
  const teamBrief = useMemo(
    () => summarizeTeam(directReports, fullStats, benchmarkVersions, MVP_COMPETENCY_CODE),
    [directReports, fullStats, benchmarkVersions],
  )

  const coacheeIds = useMemo(() => new Set(directReports.map((p) => p.id)), [directReports])
  const teamCards = useMemo(
    () => reportCards.filter((c) => coacheeIds.has(c.personId)),
    [reportCards, coacheeIds],
  )
  const queue = useMemo(() => awaitingReviews(teamCards), [teamCards])
  const mix = useMemo(() => verdictMix(teamCards), [teamCards])

  const breadcrumbFilter =
    statusFilter === "all" ? null : (
      <p className="text-xs text-muted-foreground">
        Filter: <span className="font-medium text-foreground">{statusFilter}</span>
        {" · "}
        <button type="button" className="text-forest underline-offset-2 hover:underline" onClick={() => setStatusFilter("all")}>
          Clear
        </button>
      </p>
    )

  return (
    <div className="flex flex-col gap-6">
      <TeamReportsScopeBar
        coacheeCount={directReports.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExport={() => toast.success("Team summary queued", { description: "PDF generating for your direct reports" })}
      />

      {breadcrumbFilter}

      <TeamOutcomeHero
        avgProgress={stats.avgProgress}
        onTrack={stats.onTrack}
        total={stats.total}
        atRisk={stats.behind + stats.failed}
        reviewCount={stats.pendingReportCards}
      />

      <TeamStrategicInsight
        avgProgress={stats.avgProgress}
        atRisk={stats.behind + stats.failed}
        reviewCount={stats.pendingReportCards}
        completionRate={analytics.completionRate}
        topBottleneck={analytics.bottlenecks[0]}
        recommendation={teamBrief.recommendation}
      />

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 space-y-4 lg:col-span-8">
          <TeamProgressChart people={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          {analytics.bottlenecks.length > 0 && (
            <figure className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-[var(--grove-surface-subtle)]/40 px-4 py-4 ring-1 ring-foreground/[0.04]">
              <figcaption>
                <p className="font-heading text-sm font-semibold">Shared skill pressure</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Where multiple coachees miss the same benchmark skill — useful for team office hours.
                </p>
              </figcaption>
              <ul className="mt-4 space-y-2">
                {analytics.bottlenecks.map((b) => (
                  <li key={b.skill} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{b.skill}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {b.atRiskCount}/{b.total} below target ({b.ratePct}%)
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Report card verdicts: {mix.success} success · {mix.partial} partial · {mix.fail} fail
                {mix.total ? ` · ${mix.total} total` : ""}
              </p>
            </figure>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <ReviewQueuePanel queue={queue} people={directReports} />
          {selectedId && (
            <div className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-card px-3 py-3 text-sm ring-1 ring-foreground/[0.04]">
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Drill-down</p>
              <p className="mt-1 font-medium">
                {directReports.find((p) => p.id === selectedId)?.name ?? "Coachee"}
              </p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-forest underline-offset-2 hover:underline"
                onClick={() => navigate(`/people/${selectedId}/report-card`)}
              >
                Open report card →
              </button>
            </div>
          )}
        </div>
      </div>

      <TeamExceptionList
        people={filtered}
        onDrill={(id) => navigate(`/people/${id}/report-card`)}
      />
    </div>
  )
}
