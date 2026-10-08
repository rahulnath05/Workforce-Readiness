import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { BenchmarkCatalogueArticleHeader } from "@/components/grove/editorial/benchmark-catalogue-article-header"
import { BenchmarkCatalogueSummarySection } from "@/components/grove/editorial/benchmark-catalogue-summary-section"
import { BenchmarkProfileEditorialCatalogue } from "@/components/grove/editorial/benchmark-profile-editorial-catalogue"
import {
  aggregateCohorts,
  buildProfileCatalogue,
  canLeaderEditCompetency,
  orgReadinessFromCatalogue,
  profileCoverage,
} from "@/domain/selectors"
import { ROLE_LEVELS } from "@/domain/types"
import { getDesignationMeta } from "@/fixtures/designation-matrix"
import { MVP_COMPETENCY_CODE, TAXONOMY_NODES } from "@/fixtures/taxonomy"

export function CompetenciesPage() {
  const {
    competencies,
    benchmarkVersions,
    searchQuery,
    scopeNodeId,
    scopeCodes,
    cohorts,
    people,
    taxonomyNodes,
  } = useWorkspace()
  const navigate = useNavigate()
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())

  const competencyCode = scopeCodes[0] ?? MVP_COMPETENCY_CODE
  const competency = competencies.find((c) => c.code === competencyCode)
  const coverage = profileCoverage(competencyCode, benchmarkVersions)
  const canEdit = canLeaderEditCompetency(competencyCode, scopeNodeId, TAXONOMY_NODES)
  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? competency?.name ?? "Competency"

  const profileRows = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return buildProfileCatalogue(competencyCode, benchmarkVersions, cohorts, people).filter((pr) => {
      if (!q) return true
      const hay = `${pr.profile.label} ${pr.profile.designationLevel} ${pr.profile.family ?? ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [competencyCode, benchmarkVersions, cohorts, people, searchQuery])

  const orgReadiness = orgReadinessFromCatalogue(profileRows)

  const cohortRows = useMemo(
    () => aggregateCohorts(cohorts, people, scopeCodes).sort((a, b) => b.atRiskCount - a.atRiskCount),
    [cohorts, people, scopeCodes],
  )
  const cohortsAtRisk = cohortRows.filter((c) => c.atRiskCount > 0).length

  const pullQuote =
    coverage.published < coverage.total
      ? `${coverage.total - coverage.published} job profile${coverage.total - coverage.published === 1 ? "" : "s"} still lack a published benchmark—coverage gaps will depress the roll-up until closed.`
      : cohortsAtRisk > 0
        ? `${cohortsAtRisk} cohort${cohortsAtRisk === 1 ? "" : "s"} show learners behind plan; prioritise unpublished or at-risk profiles in this catalogue.`
        : "Benchmark coverage is complete for in-scope profiles; use this catalogue to review targets and cohort evidence before quarter close."

  const profileGroups = useMemo(() => {
    return ROLE_LEVELS.map((designation) => ({
      designation,
      meta: getDesignationMeta(designation),
      rows: profileRows.filter((pr) => pr.profile.designationLevel === designation),
    })).filter((g) => g.rows.length > 0)
  }, [profileRows])

  function openWizard(profileId?: string) {
    if (profileId) navigate(`/competencies/benchmark?profileId=${encodeURIComponent(profileId)}`)
    else navigate("/competencies/benchmark")
  }

  function toggleGroup(designation: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(designation)) next.delete(designation)
      else {
        next.add(designation)
        const inGroup = profileRows.some(
          (pr) => pr.profile.designationLevel === designation && pr.profile.id === expandedProfileId,
        )
        if (inGroup) setExpandedProfileId(null)
      }
      return next
    })
  }

  const searchActive = searchQuery.trim() || undefined

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:gap-12">
      <BenchmarkCatalogueArticleHeader
        competencyName={competency ? `${competency.name} benchmarks` : "Benchmark catalogue"}
        owner={competency?.owner}
        published={coverage.published}
        total={coverage.total}
        searchActive={searchActive}
        onNewBenchmark={() => openWizard()}
        onExport={() =>
          toast("Export queued", { description: `${scopeLabel} benchmark catalogue (PDF) is being generated.` })
        }
      />

      <BenchmarkCatalogueSummarySection
        scopeLabel={scopeLabel}
        orgReadiness={orgReadiness}
        coveragePublished={coverage.published}
        coverageTotal={coverage.total}
        cohortsAtRisk={cohortsAtRisk}
        pullQuote={pullQuote}
      />

      <section aria-labelledby="catalogue-profiles-heading" className="border-t border-border/80 pt-10">
        <h2 id="catalogue-profiles-heading" className="font-heading text-lg font-semibold tracking-tight">
          Job profiles by designation
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Chapters follow designation level. Each row links benchmark version, cohort lead, and readiness evidence for{" "}
          {scopeLabel}.
        </p>
        {profileGroups.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            {searchActive
              ? `No job profiles match “${searchActive}”. Clear search or start a benchmark journey for a new profile.`
              : "No job profiles are in scope for this competency yet."}
          </p>
        ) : (
          <div className="mt-8">
            <BenchmarkProfileEditorialCatalogue
              groups={profileGroups}
              collapsedGroups={collapsedGroups}
              onToggleGroup={toggleGroup}
              expandedProfileId={expandedProfileId}
              onToggleDetail={(id) => setExpandedProfileId(expandedProfileId === id ? null : id)}
              canEdit={canEdit}
              onEditProfile={openWizard}
            />
          </div>
        )}
      </section>
    </article>
  )
}
