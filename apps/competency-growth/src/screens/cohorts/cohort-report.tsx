import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { CohortEditorialRoster } from "@/components/grove/editorial/cohort-editorial-roster"
import { CohortReportArticleHeader } from "@/components/grove/editorial/cohort-report-article-header"
import { CohortReportSummarySection } from "@/components/grove/editorial/cohort-report-summary-section"
import { buildCohortRosterDisplay, cohortRosterMembers } from "@/domain/cohort-model"
import { buildProfileCatalogue } from "@/domain/selectors"
import { getJobProfile } from "@/fixtures/designation-matrix"

export function CohortReportPage() {
  const { cohortId } = useParams()
  const navigate = useNavigate()
  const { cohorts, people, benchmarkVersions } = useWorkspace()

  const cohort = cohorts.find((c) => c.id === cohortId)
  const profile = cohort ? getJobProfile(cohort.jobProfileId) : undefined
  const roster = cohort ? cohortRosterMembers(people, cohort) : []
  const lead = cohort ? people.find((p) => p.id === cohort.leadPersonId) : undefined

  const catalogueRow = useMemo(() => {
    if (!cohort) return undefined
    return buildProfileCatalogue(cohort.competencyCode, benchmarkVersions, cohorts, people).find(
      (r) => r.profile.id === cohort.jobProfileId,
    )
  }, [cohort, benchmarkVersions, cohorts, people])

  const headcount = catalogueRow?.memberCount ?? roster.length
  const atRisk = catalogueRow?.atRiskCount ?? 0
  const readinessPct = catalogueRow?.overallReadinessPct
  const readinessLabel =
    readinessPct !== null && readinessPct !== undefined ? `${readinessPct}%` : "—"

  const displayRoster = useMemo(() => {
    if (!cohort) return []
    const sampleProgress = roster.length
      ? Math.round(roster.reduce((s, p) => s + p.progress, 0) / roster.length)
      : readinessPct ?? 68
    return buildCohortRosterDisplay(people, cohort, headcount, {
      atRiskCount: atRisk,
      avgProgress: sampleProgress,
    })
  }, [cohort, people, headcount, atRisk, roster, readinessPct])

  const avgProgress = displayRoster.length
    ? Math.round(displayRoster.reduce((s, m) => s + m.progress, 0) / displayRoster.length)
    : 0
  const onTrack = displayRoster.filter((m) => m.status === "On track" || m.status === "Completed").length

  const benchmarkLabel = catalogueRow?.version
    ? `benchmark v${catalogueRow.version.version}`
    : undefined

  const summary =
    headcount > 0
      ? `This cohort rolls up ${headcount} learners at the ${cohort?.designationLevel ?? "profile"} level. Aggregate readiness is ${readinessLabel} against the published benchmark, with average cycle progress at ${avgProgress}%.`
      : "No learners are assigned to this job profile cohort yet."

  const pullQuote =
    atRisk > 0
      ? `${atRisk} learner${atRisk === 1 ? "" : "s"} in this cohort are behind or flagged—coordinate with ${lead?.name ?? "the cohort lead"} before the next readiness export.`
      : readinessPct !== null && readinessPct !== undefined && readinessPct >= 75
        ? "Cohort readiness is healthy relative to benchmark; focus on sustaining momentum and closing report cards."
        : "Use the roster below for spot checks; nudge the cohort when progress clusters below plan."

  if (!cohort || !profile) {
    return (
      <article className="mx-auto max-w-5xl">
        <p className="text-sm text-muted-foreground">Cohort not found.</p>
      </article>
    )
  }

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-12 md:gap-12">
      <CohortReportArticleHeader
        profileLabel={profile.label}
        designationLevel={cohort.designationLevel}
        headcount={headcount}
        atRisk={atRisk}
        readinessLabel={readinessLabel}
        leadName={lead?.name ?? "Unassigned"}
        benchmarkLabel={benchmarkLabel}
        onNudge={() =>
          toast.success("Nudge sent", { description: `${profile.label} cohort — ${headcount} learners` })
        }
      />

      <CohortReportSummarySection
        summary={summary}
        pullQuote={pullQuote}
        stats={{
          headcount,
          atRisk,
          readinessLabel,
          avgProgress,
          onTrack,
        }}
      />

      <section aria-labelledby="cohort-roster-heading" className="border-t border-border/80 pt-10">
        <h2 id="cohort-roster-heading" className="font-heading text-lg font-semibold tracking-tight">
          Learner roster
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Figure 1. Members on this job profile, grouped by cycle status. Demo rows pad the register to catalogue
          headcount for reporting previews.
        </p>
        <div className="mt-8">
          <CohortEditorialRoster
            roster={displayRoster}
            onOpenMember={(id) => navigate(`/people/${id}/report-card`)}
          />
        </div>
      </section>
    </article>
  )
}
