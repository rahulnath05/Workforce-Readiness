import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { Journey } from "@/components/grove/journey"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { ProfileReadinessRollup } from "@/screens/leader/profile-readiness-rollup"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { aggregateCohorts, buildProfileCatalogue, orgReadinessFromCatalogue, profileCoverage } from "@/domain/selectors"
import type { JourneyStep } from "@/domain/types"
import { MVP_COMPETENCY_CODE } from "@/fixtures/taxonomy"

const SCOPE_LABEL = "Data and Analytics"

export function LeaderOverview() {
  const navigate = useNavigate()
  const {
    preview,
    setPreview,
    hasDualJourneyAccess,
    people,
    scopeCodes,
    cohorts,
    benchmarkVersions,
  } = useWorkspace()

  const primaryCompetencyCode = scopeCodes[0] ?? MVP_COMPETENCY_CODE
  const coverage = profileCoverage(primaryCompetencyCode, benchmarkVersions)
  const cohortRows = useMemo(
    () => aggregateCohorts(cohorts, people, scopeCodes).sort((a, b) => b.atRiskCount - a.atRiskCount),
    [cohorts, people, scopeCodes],
  )
  const cohortsAtRisk = cohortRows.filter((c) => c.atRiskCount > 0).length
  const profileCatalogue = useMemo(
    () => buildProfileCatalogue(primaryCompetencyCode, benchmarkVersions, cohorts, people),
    [primaryCompetencyCode, benchmarkVersions, cohorts, people],
  )
  const orgReadiness = orgReadinessFromCatalogue(profileCatalogue)

  const benchmarkJourney: JourneyStep[] = [
    { label: "Define benchmark", hint: `${coverage.published}/${coverage.total} profiles`, state: coverage.published > 0 ? "done" : "current" },
    { label: "Validate taxonomy", hint: "Skills and levels", state: coverage.published > 0 ? "done" : "later" },
    { label: "Publish & assign", hint: "Per job profile", state: coverage.published < coverage.total ? "current" : "done" },
    { label: "Monitor readiness", hint: "Cohort roll-up", state: coverage.published === coverage.total ? "current" : "later" },
    { label: "Review outcomes", hint: "Report cards", state: "later" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Competency portfolio"
        title="Good morning, Ananya."
        lede={`See profile health, benchmark coverage, and cohort risk for ${SCOPE_LABEL}—one readiness roll-up per job profile, not skill-by-skill grids.`}
        primary="Create benchmark"
        secondary="Export snapshot"
        onPrimary={() => navigate("/competencies")}
        onSecondary={() => toast("Export queued", { description: `${SCOPE_LABEL} snapshot (PDF) is being generated.` })}
      />
      {hasDualJourneyAccess && <Journey title="Benchmark cycle" steps={benchmarkJourney} />}
      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<OverviewSkeleton />}
        emptyTitle="No competency is live yet"
        emptyBody="Publish a job profile benchmark to see cohort readiness and coverage."
        emptyAction="Create benchmark"
        onEmptyAction={() => navigate("/competencies")}
        errorMessage={`Aptora couldn’t load ${SCOPE_LABEL}. The last refresh was May 21, 4:10 PM.`}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Profiles published" value={`${coverage.published}/${coverage.total}`} hint="Job profiles with a live benchmark" tone="dark" />
          <StatCard label="Cohorts at risk" value={String(cohortsAtRisk)} hint="Profile cohorts needing attention" />
          <StatCard
            label="Org readiness"
            value={orgReadiness !== null ? `${orgReadiness}%` : "—"}
            hint="Weighted vs published benchmarks"
          />
          <StatCard label="Plans closing soon" value={String(cohortRows.filter((c) => c.atRiskCount > 0).length)} hint="Within 14 days · cohort level">
            <Button type="button" variant="link" className="h-auto px-0 text-forest" onClick={() => navigate("/reports")}>
              View reports
            </Button>
          </StatCard>
        </div>
        <ProfileReadinessRollup
          competencyCode={primaryCompetencyCode}
          scopeLabel={SCOPE_LABEL}
          people={people}
          benchmarkVersions={benchmarkVersions}
          cohorts={cohorts}
        />
      </DataFrame>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--grove-radius-panel)]" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-[var(--grove-radius-panel)]" />
    </>
  )
}
