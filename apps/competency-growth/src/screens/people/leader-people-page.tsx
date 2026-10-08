import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { CoacheesEditorialRoster } from "@/components/grove/editorial/coachees-editorial-roster"
import { PopulationArticleHeader } from "@/components/grove/editorial/population-article-header"
import { PopulationCohortsChapter } from "@/components/grove/editorial/population-cohorts-chapter"
import { PopulationProfileSheet } from "@/components/grove/editorial/population-profile-sheet"
import { PopulationSummarySection } from "@/components/grove/editorial/population-summary-section"
import { buildCohortForProfile } from "@/domain/cohort-model"
import { teamSummaryStats } from "@/domain/selectors"
import type { PersonRecord } from "@/domain/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getJobProfile, getJobProfiles } from "@/fixtures/designation-matrix"
import { MVP_COMPETENCY_CODE } from "@/fixtures/taxonomy"

export function LeaderPeoplePage() {
  const navigate = useNavigate()
  const {
    scopedPeople,
    searchQuery,
    heatmapFilter,
    cohorts,
    reportCards,
    taxonomyNodes,
    scopeNodeId,
    scopeCodes,
    upsertCohort,
  } = useWorkspace()

  const [selected, setSelected] = useState<PersonRecord | null>(null)
  const [cohortDialog, setCohortDialog] = useState(false)
  const [newCohortProfileId, setNewCohortProfileId] = useState("da-analytics-manager")

  const competencyCode = scopeCodes[0] ?? MVP_COMPETENCY_CODE
  const daProfiles = getJobProfiles(competencyCode)
  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? "Competency scope"

  const filterLabel = heatmapFilter.skill
    ? `Short on ${heatmapFilter.skill}${heatmapFilter.role ? ` · ${heatmapFilter.role}` : ""}`
    : heatmapFilter.jobProfileId
      ? getJobProfile(heatmapFilter.jobProfileId)?.label ?? "Job profile"
      : "All in scope"

  const list = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return scopedPeople
    return scopedPeople.filter(
      (p) =>
        `${p.name} ${p.focus} ${p.role}`.toLowerCase().includes(q) ||
        p.skills.some((s) => s.skill.toLowerCase().includes(q)),
    )
  }, [scopedPeople, searchQuery])

  const stats = useMemo(() => teamSummaryStats(list, reportCards), [list, reportCards])
  const unassignedCohort = list.filter((p) => !p.cohortId).length

  const memberCountByCohortId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of scopedPeople) {
      if (p.cohortId) counts[p.cohortId] = (counts[p.cohortId] ?? 0) + 1
    }
    return counts
  }, [scopedPeople])

  const summary =
    stats.total > 0
      ? `${stats.total} learners are in scope for ${scopeLabel}. Average cycle progress is ${stats.avgProgress}% with ${stats.onTrack} on track against published benchmarks.`
      : `No learners are currently in scope for ${scopeLabel}. Adjust taxonomy scope or publish benchmarks to populate this register.`

  const pullQuote =
    unassignedCohort > 0
      ? `${unassignedCohort} learner${unassignedCohort === 1 ? "" : "s"} lack a profile cohort—assign them before the next readiness roll-up.`
      : stats.behind + stats.failed > 0
        ? `${stats.behind + stats.failed} learner${stats.behind + stats.failed === 1 ? "" : "s"} are behind or ended below plan; review cohort leads and exception reports.`
        : stats.urgentCount > 0
          ? `${stats.urgentCount} urgent flag${stats.urgentCount === 1 ? "" : "s"} in this scope—prioritise before quarter close.`
          : "Population progress is steady—use cohort chapters below for spot checks rather than daily triage."

  return (
    <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-12 md:gap-12">
      <PopulationArticleHeader
        scopeLabel={scopeLabel}
        filterLabel={filterLabel}
        peopleCount={list.length}
        searchActive={searchQuery.trim() || undefined}
        onManageCohorts={() => setCohortDialog(true)}
        onOpenReports={() => navigate("/reports")}
      />

      <PopulationSummarySection
        scopeLabel={scopeLabel}
        summary={summary}
        pullQuote={pullQuote}
        stats={{
          total: stats.total,
          onTrack: stats.onTrack,
          atRisk: stats.behind + stats.failed,
          avgProgress: stats.avgProgress,
          unassignedCohort,
          cohortCount: cohorts.length,
        }}
      />

      <PopulationCohortsChapter cohorts={cohorts} memberCountByCohortId={memberCountByCohortId} />

      <section aria-labelledby="population-roster-heading" className="border-t border-border/80 pt-10">
        <h2 id="population-roster-heading" className="font-heading text-lg font-semibold tracking-tight">
          Evidence by person
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Rows are grouped by cycle status. Open a profile for skill-level evidence, cohort placement, and report cards.
        </p>
        <div className="mt-8">
          <CoacheesEditorialRoster people={list} onSelect={setSelected} variant="population" />
        </div>
      </section>

      <PopulationProfileSheet person={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />

      <Dialog open={cohortDialog} onOpenChange={setCohortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create profile cohort</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Job profile</Label>
              <Select value={newCohortProfileId} onValueChange={(v) => v && setNewCohortProfileId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {daProfiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} ({p.designationLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                const profile = getJobProfile(newCohortProfileId)
                if (!profile) return
                upsertCohort(buildCohortForProfile(profile, "sanjay"))
                setCohortDialog(false)
              }}
            >
              Save cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}
