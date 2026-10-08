import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { PortfolioArticleHeader } from "@/components/grove/editorial/portfolio-article-header"
import { PortfolioSummarySection } from "@/components/grove/editorial/portfolio-summary-section"
import { ProfileReadinessRollup } from "@/screens/leader/profile-readiness-rollup"
import { Skeleton } from "@/components/ui/skeleton"
import { aggregateCohorts, buildProfileCatalogue, orgReadinessFromCatalogue, profileCoverage } from "@/domain/selectors"
import { MVP_COMPETENCY_CODE } from "@/fixtures/taxonomy"
import { APP_NAME } from "@/lib/app-name"

export function LeaderOverview() {
  const navigate = useNavigate()
  const {
    preview,
    setPreview,
    people,
    scopeCodes,
    cohorts,
    benchmarkVersions,
    taxonomyNodes,
    scopeNodeId,
  } = useWorkspace()

  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? "Data and Analytics"
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
  const plansClosing = cohortRows.filter((c) => c.atRiskCount > 0).length

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:gap-12">
      <PortfolioArticleHeader
        scopeLabel={scopeLabel}
        onCreateBenchmark={() => navigate("/competencies/benchmark")}
        onExport={() => toast("Export queued", { description: `${scopeLabel} snapshot (PDF) is being generated.` })}
      />

      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<OverviewSkeleton />}
        emptyTitle="No competency is live yet"
        emptyBody="Publish a job profile benchmark to see cohort readiness and coverage."
        emptyAction="Create benchmark"
        onEmptyAction={() => navigate("/competencies")}
        errorMessage={`${APP_NAME} couldn’t load ${scopeLabel}. The last refresh was May 21, 4:10 PM.`}
      >
        <div className="flex flex-col gap-12">
          <PortfolioSummarySection
            scopeLabel={scopeLabel}
            orgReadiness={orgReadiness}
            coveragePublished={coverage.published}
            coverageTotal={coverage.total}
            cohortsAtRisk={cohortsAtRisk}
            plansClosing={plansClosing}
          />
          <ProfileReadinessRollup
            variant="editorial"
            competencyCode={primaryCompetencyCode}
            scopeLabel={scopeLabel}
            people={people}
            benchmarkVersions={benchmarkVersions}
            cohorts={cohorts}
          />
        </div>
      </DataFrame>
    </article>
  )
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_13rem]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-prose" />
          <Skeleton className="h-20 w-full max-w-prose" />
        </div>
        <div className="space-y-4 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}
