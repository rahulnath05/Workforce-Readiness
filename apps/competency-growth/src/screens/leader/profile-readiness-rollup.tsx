import { Fragment, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useWorkspace } from "@/app/WorkspaceProvider"
import { buildProfileCatalogue, type ProfileCatalogueRow } from "@/domain/selectors"
import type { BenchmarkVersion, Cohort, PersonRecord, RoleLevel } from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { findCohortByJobProfile } from "@/domain/cohort-model"
import { getDesignationMeta } from "@/fixtures/designation-matrix"

const ROLLUP_COL_COUNT = 7

export function ProfileReadinessRollup({
  competencyCode,
  scopeLabel,
  people,
  benchmarkVersions,
  cohorts,
  onProfileNavigate,
  variant = "card",
}: {
  competencyCode: string
  scopeLabel: string
  people: PersonRecord[]
  benchmarkVersions: BenchmarkVersion[]
  cohorts: Cohort[]
  onProfileNavigate?: (jobProfileId: string) => void
  variant?: "card" | "editorial"
}) {
  const navigate = useNavigate()
  const { setHeatmapFilter } = useWorkspace()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())

  const catalogue = useMemo(
    () => buildProfileCatalogue(competencyCode, benchmarkVersions, cohorts, people),
    [competencyCode, benchmarkVersions, cohorts, people],
  )

  const groups = useMemo(() => {
    return ROLE_LEVELS.map((designation) => ({
      designation,
      meta: getDesignationMeta(designation),
      rows: catalogue.filter((r) => r.profile.designationLevel === designation),
    })).filter((g) => g.rows.length > 0)
  }, [catalogue])

  function toggleGroup(designation: RoleLevel) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(designation)) next.delete(designation)
      else next.add(designation)
      return next
    })
  }

  function openProfile(row: ProfileCatalogueRow) {
    onProfileNavigate?.(row.profile.id)
    setHeatmapFilter({ jobProfileId: row.profile.id })
    const cohort = row.cohort ?? findCohortByJobProfile(cohorts, row.profile.id)
    if (cohort) navigate(`/cohorts/${cohort.id}`)
    else navigate("/people")
  }

  const table = (
    <div className="overflow-x-auto">
        <Table className="table-fixed">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[16%]" />
            <col className="w-[8%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Job profile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Readiness</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>At risk</TableHead>
              <TableHead>Cohort lead</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => {
              const collapsed = collapsedGroups.has(group.designation)
              const publishedInGroup = group.rows.filter((r) => r.publishStatus === "Published").length
              return (
                <Fragment key={group.designation}>
                  <TableRow
                    className="bg-muted/40 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleGroup(group.designation)}
                  >
                    <TableCell colSpan={ROLLUP_COL_COUNT} className="py-2.5">
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
                    group.rows.map((row) => (
                      <TableRow
                        key={row.profile.id}
                        className="cursor-pointer"
                        onClick={() => openProfile(row)}
                      >
                        <TableCell className="font-medium">
                          <div className="truncate">{row.profile.label}</div>
                          {row.profile.family && (
                            <div className="truncate text-xs font-normal text-muted-foreground">{row.profile.family}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <PublishStatusLabel status={row.publishStatus} />
                        </TableCell>
                        <TableCell>
                          <ReadinessBar percent={row.overallReadinessPct} />
                        </TableCell>
                        <TableCell className="tabular-nums">{row.memberCount}</TableCell>
                        <TableCell
                          className={cn(
                            "tabular-nums",
                            row.atRiskCount > 0 && "text-[var(--grove-attention)] font-medium",
                          )}
                        >
                          {row.atRiskCount}
                        </TableCell>
                        <TableCell className="truncate">{row.leadName}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-forest"
                            onClick={() => openProfile(row)}
                          >
                            Open
                            <ExternalLinkIcon className="ml-1 size-3" aria-hidden />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
    </div>
  )

  const footerLinks = (
    <>
      <Button type="button" variant="link" className="h-auto p-0 text-forest" render={<Link to="/competencies" />}>
        Open benchmarks
      </Button>
      <Button type="button" variant="link" className="h-auto p-0 text-muted-foreground" render={<Link to="/reports" />}>
        Full metrics
      </Button>
    </>
  )

  if (variant === "editorial") {
    return (
      <section aria-labelledby="profile-readiness-figure" className="pt-2">
        <h2 id="profile-readiness-figure" className="font-heading text-lg font-semibold tracking-tight">
          Evidence by job profile
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Figure 1. Overall readiness versus published benchmarks, grouped by designation. Select a row to open the
          cohort or people view for {scopeLabel}.
        </p>
        <div className="mt-6 border border-border/70">{table}</div>
        <p className="mt-2 text-[11px] text-muted-foreground">Source: live benchmark versions and cohort membership.</p>
        <div className="mt-6 flex flex-wrap gap-4 border-t border-border/70 pt-4">{footerLinks}</div>
      </section>
    )
  }

  return (
    <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
      <CardHeader>
        <CardTitle className="font-heading">Profile readiness</CardTitle>
        <CardDescription>
          Overall readiness vs published benchmarks by job profile · {scopeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">{table}</CardContent>
      <CardFooter className="flex flex-wrap gap-4 border-t pt-4">{footerLinks}</CardFooter>
    </Card>
  )
}

function PublishStatusLabel({ status }: { status: "Published" | "Not published" }) {
  if (status === "Published") {
    return <span className="text-sm font-medium text-forest">Published</span>
  }
  return <span className="text-sm text-muted-foreground">Not published</span>
}

function ReadinessBar({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <span className="text-sm text-muted-foreground">—</span>
  }
  return (
    <div className="flex w-full max-w-[12rem] items-center gap-2">
      <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-forest" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-sm tabular-nums">{percent}%</span>
    </div>
  )
}
