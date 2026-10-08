import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileSpreadsheetIcon, FileTextIcon, TableIcon } from "lucide-react"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DesignationReadinessOverview } from "@/components/grove/reports/designation-readiness-overview"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EXPORT_PACKS } from "@/data/workforce/reports"
import {
  atRiskCatalogueRows,
  awaitingReviews,
  filterCatalogueRows,
  readinessByDesignation,
} from "@/domain/report-aggregates"
import type { RoleLevel } from "@/domain/types"
import { buildProfileCatalogue, orgReadinessFromCatalogue, profileCoverage } from "@/domain/selectors"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import { AtRiskCohortBoard } from "@/components/grove/reports/at-risk-cohort-board"
import { ReviewQueuePanel } from "@/components/grove/reports/review-queue-panel"

const FORMAT_ICONS = {
  PDF: FileTextIcon,
  XLSX: FileSpreadsheetIcon,
  CSV: TableIcon,
} as const

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

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow={scopeLabel}
        title="Reports"
        secondary="Export"
        onSecondary={() => toast.success("Board pack queued", { description: "PDF generating" })}
      />

      <div className="flex flex-wrap gap-2">
        <Select value={competencyFilter} onValueChange={(v) => v && setCompetencyFilter(v)}>
          <SelectTrigger className="w-44" aria-label="Competency filter">
            <SelectValue placeholder="Competency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competencies</SelectItem>
            {competencies.filter((c) => scopeCodes.includes(c.code)).map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cohortFilter} onValueChange={(v) => v && setCohortFilter(v)}>
          <SelectTrigger className="w-44" aria-label="Cohort filter">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {scopedCohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Readiness"
          value={orgReadiness !== null ? `${orgReadiness}%` : "—"}
          tone="dark"
        />
        <StatCard
          label="Benchmarks"
          value={`${coverage.published}/${coverage.total}`}
          hint="Published profiles"
        />
        <StatCard label="At risk" value={String(atRiskTotal)} hint="Learners behind" />
        <StatCard label="Reviews" value={String(reviewCount)} hint="Awaiting sign-off" />
      </div>

      <DesignationReadinessOverview
        orgReadiness={orgReadiness}
        rows={designationRows}
        onSelectDesignation={(role: RoleLevel) => {
          setHeatmapFilter({ role })
          navigate("/people")
        }}
      />

      <AtRiskCohortBoard rows={riskRows} people={people} />

      <ReviewQueuePanel queue={queue} people={people} />

      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Export packs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {EXPORT_PACKS.map((pack) => {
            const Icon = FORMAT_ICONS[pack.format]
            return (
              <button
                key={pack.id}
                type="button"
                className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                onClick={() =>
                  toast.success("Export queued", {
                    description: `${pack.label} · ${pack.format}`,
                  })
                }
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{pack.label}</p>
                  <p className="text-xs text-muted-foreground">{pack.updated}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">{pack.format}</Badge>
              </button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
