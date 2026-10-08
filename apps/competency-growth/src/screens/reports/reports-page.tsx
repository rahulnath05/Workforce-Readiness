import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DesignationReadinessOverview } from "@/components/grove/reports/designation-readiness-overview"
import { ReportsExceptionList } from "@/components/grove/reports/reports-exception-list"
import { ReportsExportPanel } from "@/components/grove/reports/reports-export-panel"
import { ReportsOutcomeHero } from "@/components/grove/reports/reports-outcome-hero"
import { ReportsScopeBar } from "@/components/grove/reports/reports-scope-bar"
import { ReportsStrategicInsight } from "@/components/grove/reports/reports-strategic-insight"
import { PageIntro } from "@/components/grove/page-intro"
import { ReviewQueuePanel } from "@/components/grove/reports/review-queue-panel"
import {
  atRiskCatalogueRows,
  awaitingReviews,
  filterCatalogueRows,
  readinessByDesignation,
} from "@/domain/report-aggregates"
import type { RoleLevel } from "@/domain/types"
import { buildProfileCatalogue, orgReadinessFromCatalogue, profileCoverage } from "@/domain/selectors"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"

export function ReportsPage() {
  const { persona } = useWorkspace()

  if (persona !== "leader") {
    return (
      <PageIntro
        eyebrow="Outcomes"
        title="Reports"
        lede="Switch to Competency Leader for outcome packs."
      />
    )
  }

  return <LeaderReportsDashboard />
}

function LeaderReportsDashboard() {
  const navigate = useNavigate()
  const {
    cohorts,
    competencies,
    reportCards,
    scopeCodes,
    taxonomyNodes,
    scopeNodeId,
    people,
    benchmarkVersions,
    setHeatmapFilter,
  } = useWorkspace()
  const [cohortFilter, setCohortFilter] = useState<string>("all")
  const [competencyFilter, setCompetencyFilter] = useState<string>("all")

  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? "Portfolio"

  const activeCompetencyCode =
    competencyFilter === "all"
      ? scopeCodes[0] ?? MVP_COMPETENCY_CODE
      : competencyFilter

  const activeCompetency = competencies.find((c) => c.code === activeCompetencyCode)
  const competencyNameForCards =
    competencyFilter === "all" ? undefined : activeCompetency?.name

  const catalogue = useMemo(
    () => buildProfileCatalogue(activeCompetencyCode, benchmarkVersions, cohorts, people),
    [activeCompetencyCode, benchmarkVersions, cohorts, people],
  )

  const filteredCatalogue = useMemo(
    () => filterCatalogueRows(catalogue, { cohortId: cohortFilter, cohorts }),
    [catalogue, cohortFilter, cohorts],
  )

  const orgReadiness = orgReadinessFromCatalogue(filteredCatalogue)
  const coverage = profileCoverage(activeCompetencyCode, benchmarkVersions)
  const atRiskTotal = filteredCatalogue.reduce((s, r) => s + r.atRiskCount, 0)
  const designationRows = readinessByDesignation(filteredCatalogue)
  const riskRows = atRiskCatalogueRows(filteredCatalogue).filter((r) => r.cohort)
  const queue = awaitingReviews(reportCards, competencyNameForCards)
  const reviewCount = queue.length

  const scopedCohorts = cohorts.filter(
    (c) => c.competencyCode === activeCompetencyCode,
  )

  const competencyOptions = competencies
    .filter((c) => scopeCodes.includes(c.code))
    .map((c) => ({ code: c.code, name: c.name }))

  const weakest = useMemo(() => {
    const withPct = designationRows.filter((r) => r.readinessPct !== null)
    if (!withPct.length) return { designation: null as RoleLevel | null, pct: null as number | null }
    const sorted = [...withPct].sort((a, b) => (a.readinessPct ?? 0) - (b.readinessPct ?? 0))
    const w = sorted[0]
    return { designation: w.designation, pct: w.readinessPct }
  }, [designationRows])

  return (
    <div className="flex flex-col gap-6">
      <ReportsScopeBar
        scopeLabel={scopeLabel}
        competencyFilter={competencyFilter}
        cohortFilter={cohortFilter}
        onCompetencyChange={setCompetencyFilter}
        onCohortChange={setCohortFilter}
        competencies={competencyOptions}
        cohorts={scopedCohorts.map((c) => ({ id: c.id, name: c.name }))}
        onExport={() => toast.success("Board pack queued", { description: "PDF generating" })}
      />

      <ReportsOutcomeHero
        readiness={orgReadiness}
        benchmarkPublished={coverage.published}
        benchmarkTotal={coverage.total}
        atRiskTotal={atRiskTotal}
        reviewCount={reviewCount}
      />

      <ReportsStrategicInsight
        readiness={orgReadiness}
        atRiskTotal={atRiskTotal}
        weakestDesignation={weakest.designation}
        weakestPct={weakest.pct}
        reviewCount={reviewCount}
      />

      <DesignationReadinessOverview
        orgReadiness={orgReadiness}
        rows={designationRows}
        showOverallBadge={false}
        onSelectDesignation={(role: RoleLevel) => {
          setHeatmapFilter({ role })
          navigate("/people")
        }}
      />

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 lg:col-span-8">
          <ReportsExceptionList rows={riskRows} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <ReviewQueuePanel queue={queue} people={people} />
          <ReportsExportPanel />
        </div>
      </div>
    </div>
  )
}
