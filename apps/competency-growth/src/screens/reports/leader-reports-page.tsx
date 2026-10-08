import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DesignationReadinessOverview } from "@/components/grove/reports/designation-readiness-overview"
import { ReadinessTrendPanel } from "@/components/grove/reports/readiness-trend-panel"
import { ReportsExceptionList } from "@/components/grove/reports/reports-exception-list"
import { ReportsExportPanel } from "@/components/grove/reports/reports-export-panel"
import { ReportsOutcomeHero } from "@/components/grove/reports/reports-outcome-hero"
import { ReportsScopeBar } from "@/components/grove/reports/reports-scope-bar"
import { ReportsStrategicInsight } from "@/components/grove/reports/reports-strategic-insight"
import { ReviewQueuePanel } from "@/components/grove/reports/review-queue-panel"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import {
  atRiskCatalogueRows,
  awaitingReviews,
  filterCatalogueRows,
  readinessByDesignation,
  verdictMix,
} from "@/domain/report-aggregates"
import type { RoleLevel } from "@/domain/types"
import { buildProfileCatalogue, orgReadinessFromCatalogue, profileCoverage } from "@/domain/selectors"

export function LeaderReportsPage() {
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
  const [selectedDesignation, setSelectedDesignation] = useState<RoleLevel | null>(null)

  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? "Portfolio"

  const activeCompetencyCode =
    competencyFilter === "all" ? scopeCodes[0] ?? MVP_COMPETENCY_CODE : competencyFilter

  const activeCompetency = competencies.find((c) => c.code === activeCompetencyCode)
  const competencyNameForCards = competencyFilter === "all" ? undefined : activeCompetency?.name

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
  const mix = useMemo(() => verdictMix(reportCards, competencyNameForCards), [reportCards, competencyNameForCards])

  const scopedCohorts = cohorts.filter((c) => c.competencyCode === activeCompetencyCode)

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

  const cohortFilterLabel =
    cohortFilter === "all"
      ? null
      : scopedCohorts.find((c) => c.id === cohortFilter)?.name ?? "Cohort"

  const competencyFilterLabel =
    competencyFilter === "all" ? null : activeCompetency?.name ?? "Competency"

  const hasActiveFilters = competencyFilter !== "all" || cohortFilter !== "all"

  function clearFilters() {
    setCompetencyFilter("all")
    setCohortFilter("all")
    setSelectedDesignation(null)
  }

  function drillToPeople(role: RoleLevel) {
    setSelectedDesignation(role)
    setHeatmapFilter({ role })
  }

  return (
    <div className="flex flex-col gap-6">
      <ReportsScopeBar
        scopeLabel={scopeLabel}
        competencyFilter={competencyFilter}
        cohortFilter={cohortFilter}
        onCompetencyChange={(code) => {
          setCompetencyFilter(code)
          setSelectedDesignation(null)
        }}
        onCohortChange={(id) => {
          setCohortFilter(id)
          setSelectedDesignation(null)
        }}
        competencies={competencyOptions}
        cohorts={scopedCohorts.map((c) => ({ id: c.id, name: c.name }))}
        onExport={() => toast.success("Board pack queued", { description: "PDF generating" })}
      />

      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground">
          Scope:{" "}
          {competencyFilterLabel && (
            <span className="font-medium text-foreground">{competencyFilterLabel}</span>
          )}
          {competencyFilterLabel && cohortFilterLabel && " · "}
          {cohortFilterLabel && <span className="font-medium text-foreground">{cohortFilterLabel}</span>}
          {" · "}
          <button
            type="button"
            className="text-forest underline-offset-2 hover:underline"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </p>
      )}

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

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 space-y-4 lg:col-span-8">
          <ReadinessTrendPanel currentReadiness={orgReadiness} />

          <DesignationReadinessOverview
            orgReadiness={orgReadiness}
            rows={designationRows}
            showOverallBadge
            onSelectDesignation={drillToPeople}
          />

          {mix.total > 0 && (
            <figure
              className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-[var(--grove-surface-subtle)]/40 px-4 py-4 ring-1 ring-foreground/[0.04]"
              aria-labelledby="verdict-mix-caption"
            >
              <figcaption id="verdict-mix-caption">
                <p className="font-heading text-sm font-semibold">Outcome mix</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Report card verdicts in the current competency filter — signals closure quality before export.
                </p>
              </figcaption>
              <p className="mt-4 text-sm tabular-nums text-foreground">
                {mix.success} success · {mix.partial} partial · {mix.fail} fail
                <span className="text-muted-foreground"> · {mix.total} total</span>
              </p>
            </figure>
          )}

          <ReportsExceptionList rows={riskRows} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <ReviewQueuePanel queue={queue} people={people} />
          <ReportsExportPanel />
          {selectedDesignation && (
            <div className="rounded-[var(--grove-radius-panel)] border border-border/80 bg-card px-3 py-3 text-sm ring-1 ring-foreground/[0.04]">
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Strategic drill</p>
              <p className="mt-1 font-medium">{selectedDesignation}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                People directory will filter to this designation band.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="text-xs font-medium text-forest underline-offset-2 hover:underline"
                  onClick={() => navigate("/people")}
                >
                  View people →
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => setSelectedDesignation(null)}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
