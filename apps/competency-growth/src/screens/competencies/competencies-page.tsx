import { Fragment, useMemo, useState } from "react"
import { ChevronDownIcon, EyeIcon, PencilIcon } from "lucide-react"
import { cn } from "cn"

import { useWorkspace } from "@/app/WorkspaceProvider"
import {
  buildProfileCatalogue,
  canLeaderEditCompetency,
  profileCoverage,
  type ProfileCatalogueRow,
} from "@/domain/selectors"
import { ROLE_LEVELS } from "@/domain/types"
import { getDesignationMeta } from "@/fixtures/designation-matrix"
import { formatProficiencyShort } from "@/domain/proficiency"
import { BenchmarkWizard } from "@/screens/competencies/benchmark-wizard"
import { PageIntro } from "@/components/grove/page-intro"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  } = useWorkspace()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardSeed, setWizardSeed] = useState<{ code?: string; profileId?: string }>({})
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())

  const competencyCode = scopeCodes[0] ?? MVP_COMPETENCY_CODE
  const competency = competencies.find((c) => c.code === competencyCode)
  const coverage = profileCoverage(competencyCode, benchmarkVersions)
  const canEdit = canLeaderEditCompetency(competencyCode, scopeNodeId, TAXONOMY_NODES)

  const profileRows = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return buildProfileCatalogue(competencyCode, benchmarkVersions, cohorts, people).filter((pr) => {
      if (!q) return true
      const hay = `${pr.profile.label} ${pr.profile.designationLevel} ${pr.profile.family ?? ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [competencyCode, benchmarkVersions, cohorts, people, searchQuery])

  const profileGroups = useMemo(() => {
    return ROLE_LEVELS.map((designation) => ({
      designation,
      meta: getDesignationMeta(designation),
      rows: profileRows.filter((pr) => pr.profile.designationLevel === designation),
    })).filter((g) => g.rows.length > 0)
  }, [profileRows])

  const pageTitle = competency ? `${competency.name} benchmarks` : "Benchmarks"

  function openWizard(profileId?: string) {
    setWizardSeed({ code: competencyCode, profileId })
    setWizardOpen(true)
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

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Benchmark catalogue"
        title={pageTitle}
        lede={`${coverage.published} of ${coverage.total} job profiles published — open metrics on any row for targets and cohort detail.`}
        primary="New benchmark"
        onPrimary={() => openWizard()}
      />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading">Job profiles</CardTitle>
          <CardDescription>
            {competency?.owner ? `Owned by ${competency.owner}` : "Designation and profile catalogue"}
            {coverage.published < coverage.total && (
              <span className="text-muted-foreground"> · {coverage.total - coverage.published} profiles still need a benchmark</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job profile</TableHead>
                <TableHead>Benchmark</TableHead>
                <TableHead>Cohort lead</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>At risk</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profileGroups.map((group) => {
                const publishedInGroup = group.rows.filter((r) => r.publishStatus === "Published").length
                const collapsed = collapsedGroups.has(group.designation)
                return (
                  <Fragment key={group.designation}>
                    <TableRow
                      className="bg-muted/40 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleGroup(group.designation)}
                    >
                      <TableCell colSpan={7} className="py-2.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <ChevronDownIcon
                            className={cn(
                              "size-3.5 shrink-0 text-muted-foreground transition-transform",
                              collapsed && "-rotate-90",
                            )}
                            aria-hidden
                          />
                          <span className="font-heading text-sm font-semibold">{group.designation}</span>
                          {group.meta && (
                            <span className="text-xs text-muted-foreground">{group.meta.yoeRange}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            · {group.rows.length} profiles · {publishedInGroup}/{group.rows.length} published
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {!collapsed &&
                      group.rows.map((pr) => (
                      <ProfileTableRows
                        key={pr.profile.id}
                        pr={pr}
                        detailOpen={expandedProfileId === pr.profile.id}
                        canEdit={canEdit}
                        onToggleDetail={() =>
                          setExpandedProfileId(expandedProfileId === pr.profile.id ? null : pr.profile.id)
                        }
                        onEdit={() => openWizard(pr.profile.id)}
                      />
                      ))}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BenchmarkWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialCompetency={wizardSeed.code ?? competencyCode}
        initialProfileId={wizardSeed.profileId}
      />
    </div>
  )
}

function ProfileTableRows({
  pr,
  detailOpen,
  canEdit,
  onToggleDetail,
  onEdit,
}: {
  pr: ProfileCatalogueRow
  detailOpen: boolean
  canEdit: boolean
  onToggleDetail: () => void
  onEdit: () => void
}) {
  return (
    <Fragment>
      <TableRow>
        <TableCell className="font-medium">
          <div>{pr.profile.label}</div>
          {pr.profile.family && (
            <div className="text-xs font-normal text-muted-foreground">{pr.profile.family}</div>
          )}
        </TableCell>
        <TableCell>
          {pr.publishStatus === "Published" ? (
            <span className="text-sm">
              v{pr.version?.version} · {pr.version?.planWindow ?? "90 days"}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Not published</span>
          )}
        </TableCell>
        <TableCell>{pr.leadName}</TableCell>
        <TableCell>{pr.memberCount}</TableCell>
        <TableCell>{pr.memberCount > 0 ? `${pr.avgReadinessPct}%` : "—"}</TableCell>
        <TableCell className={pr.atRiskCount > 0 ? "text-[var(--grove-attention)] font-medium" : ""}>
          {pr.atRiskCount}
        </TableCell>
        <TableCell className="text-right">
          <div className="inline-flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "size-6 p-0 text-muted-foreground hover:text-foreground",
                detailOpen && "bg-muted text-foreground",
              )}
              aria-expanded={detailOpen}
              aria-label={detailOpen ? "Hide benchmark and cohort details" : "View benchmark and cohort details"}
              onClick={onToggleDetail}
            >
              <EyeIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
            {canEdit && (
              <Button
                type="button"
                variant="ghost"
                className="size-6 p-0 text-muted-foreground hover:text-foreground"
                aria-label={pr.version ? "Republish benchmark" : "Publish benchmark"}
                onClick={onEdit}
              >
                <PencilIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {detailOpen && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={7} className="pb-4">
            <div className="grid gap-4 py-2 lg:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Benchmark targets
                </p>
                {pr.version ? (
                  <ul className="mt-2 space-y-1 text-xs">
                    {pr.version.skills.map((s) => (
                      <li key={s.name} className="flex justify-between gap-2">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground">
                          {formatProficiencyShort(s.targetProficiency)} · {s.targetProficiency}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-muted-foreground">No published benchmark for this profile yet.</p>
                )}
              </div>
              <div className="rounded-lg border bg-card p-3 text-sm">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Cohort snapshot
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Cohort</dt>
                    <dd className="font-medium">{pr.cohort?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lead</dt>
                    <dd className="font-medium">{pr.leadName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Members</dt>
                    <dd className="font-medium">{pr.memberCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg readiness</dt>
                    <dd className="font-medium">{pr.memberCount > 0 ? `${pr.avgReadinessPct}%` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">At risk</dt>
                    <dd className="font-medium">{pr.atRiskCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Family</dt>
                    <dd className="font-medium">{pr.profile.family ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}
