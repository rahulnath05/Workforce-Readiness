import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { CoacheeProfileSheet } from "@/components/grove/editorial/coachee-profile-sheet"
import { CoacheesArticleHeader } from "@/components/grove/editorial/coachees-article-header"
import { CoacheesEditorialRoster } from "@/components/grove/editorial/coachees-editorial-roster"
import { CoacheesSummarySection } from "@/components/grove/editorial/coachees-summary-section"
import { teamSummaryStats } from "@/domain/selectors"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import { summarizeTeam } from "@/lib/manager-advisor"

export function ManagerPeoplePage() {
  const navigate = useNavigate()
  const { directReports, searchQuery, benchmarkVersions, reportCards } = useWorkspace()
  const [selected, setSelected] = useState<(typeof directReports)[number] | null>(null)

  const list = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return directReports
    return directReports.filter(
      (p) =>
        `${p.name} ${p.focus} ${p.role}`.toLowerCase().includes(q) ||
        p.skills.some((s) => s.skill.toLowerCase().includes(q)),
    )
  }, [directReports, searchQuery])

  const stats = useMemo(() => teamSummaryStats(directReports, reportCards), [directReports, reportCards])
  const teamBrief = useMemo(
    () => summarizeTeam(directReports, stats, benchmarkVersions, MVP_COMPETENCY_CODE),
    [directReports, stats, benchmarkVersions],
  )

  const urgentNames = directReports.filter((p) => p.urgent).map((p) => p.name)
  const pullQuote =
    urgentNames.length > 0
      ? `Priority this week: ${urgentNames.join(" and ")}—their checkpoints are closest to slipping.`
      : stats.pendingReportCards > 0
        ? `${stats.pendingReportCards} report card${stats.pendingReportCards === 1 ? "" : "s"} need your sign-off before coachees can close the narrative with confidence.`
        : stats.behind + stats.failed > 0
          ? `${stats.behind + stats.failed} coachee${stats.behind + stats.failed === 1 ? "" : "s"} are behind or ended below plan; a short 1:1 often clears the next action.`
          : "The team is moving steadily—use this register for spot checks rather than daily stand-ups."

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-12 pb-12">
      <CoacheesArticleHeader
        coacheeCount={list.length}
        searchActive={searchQuery.trim() || undefined}
        onTeamReview={() => navigate("/")}
        onOpenReports={() => navigate("/reports")}
      />

      <CoacheesSummarySection
        summary={teamBrief.summary}
        recommendation={teamBrief.recommendation}
        pullQuote={pullQuote}
        stats={{
          total: stats.total,
          onTrack: stats.onTrack,
          atRisk: stats.behind + stats.failed,
          avgProgress: stats.avgProgress,
          pendingReportCards: stats.pendingReportCards,
        }}
      />

      <section aria-labelledby="roster-heading">
        <h2 id="roster-heading" className="font-heading text-lg font-semibold tracking-tight">Evidence by person</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Rows are grouped by cycle status. Open a profile for skill-level evidence and coaching actions.
        </p>
        <div className="mt-8">
          <CoacheesEditorialRoster people={list} onSelect={setSelected} />
        </div>
      </section>

      <CoacheeProfileSheet
        person={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </article>
  )
}
