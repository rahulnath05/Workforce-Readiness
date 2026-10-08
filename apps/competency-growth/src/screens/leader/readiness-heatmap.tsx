/** Skill×profile matrix — detailed view (e.g. competencies / lab), not Reports. */
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { ReadinessCell } from "@/components/grove/readiness-cell"
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
import type { BenchmarkVersion, HeatmapFilter, PersonRecord, RoleLevel } from "@/domain/types"
import {
  currentPublishedVersion,
  heatmapProfileGroups,
  heatmapSkillRows,
  readinessPercentForProfileSkill,
} from "@/domain/selectors"
import { getDesignationMeta } from "@/fixtures/designation-matrix"

export function ReadinessHeatmap({
  competencyCode,
  scopeLabel,
  people,
  benchmarkVersions,
  heatmapFilter,
  onCellClick,
  variant = "default",
}: {
  competencyCode: string
  scopeLabel: string
  people: PersonRecord[]
  benchmarkVersions: BenchmarkVersion[]
  heatmapFilter: HeatmapFilter
  onCellClick: (skill: string, jobProfileId: string) => void
  variant?: "default" | "compact"
}) {
  const compact = variant === "compact"
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())

  const skills = useMemo(
    () => heatmapSkillRows(competencyCode, benchmarkVersions),
    [competencyCode, benchmarkVersions],
  )
  const groups = useMemo(() => heatmapProfileGroups(competencyCode), [competencyCode])

  function toggleGroup(designation: RoleLevel) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(designation)) next.delete(designation)
      else next.add(designation)
      return next
    })
  }

  function publishedInBand(designation: RoleLevel) {
    const band = groups.find((g) => g.designation === designation)
    if (!band) return { published: 0, total: 0 }
    const published = band.profiles.filter((p) =>
      currentPublishedVersion(benchmarkVersions, competencyCode, p.id),
    ).length
    return { published, total: band.profiles.length }
  }

  return (
    <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
      {!compact && (
        <CardHeader>
          <CardTitle className="font-heading">Readiness heatmap</CardTitle>
          <CardDescription>Readiness vs published benchmark targets by job profile · {scopeLabel}</CardDescription>
        </CardHeader>
      )}
      {compact && (
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Skill matrix</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.designation)
          const meta = getDesignationMeta(group.designation)
          const { published, total } = publishedInBand(group.designation)
          return (
            <div key={group.designation} className="rounded-lg border">
              <button
                type="button"
                className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5 bg-muted/40 px-3 py-2.5 text-left hover:bg-muted/50"
                aria-expanded={!collapsed}
                onClick={() => toggleGroup(group.designation)}
              >
                <ChevronDownIcon
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                    collapsed && "-rotate-90",
                  )}
                  aria-hidden
                />
                <span className="font-heading text-sm font-semibold">{group.designation}</span>
                {meta && <span className="text-xs text-muted-foreground">{meta.yoeRange}</span>}
                <span className="text-xs text-muted-foreground">
                  · {total} profiles · {published}/{total} published
                </span>
              </button>
              {!collapsed && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 min-w-[8rem] bg-card">Skill</TableHead>
                        {group.profiles.map((profile) => (
                          <TableHead
                            key={profile.id}
                            className="max-w-[7rem] text-center text-[11px] font-medium"
                            title={profile.label}
                          >
                            <span className="line-clamp-2">{profile.label}</span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skills.map((skill) => (
                        <TableRow key={skill}>
                          <TableCell className="sticky left-0 z-10 bg-card font-medium text-sm">{skill}</TableCell>
                          {group.profiles.map((profile) => {
                            const version = currentPublishedVersion(
                              benchmarkVersions,
                              competencyCode,
                              profile.id,
                            )
                            const pct = readinessPercentForProfileSkill(
                              people,
                              competencyCode,
                              profile.id,
                              skill,
                              version,
                            )
                            const selected =
                              heatmapFilter.skill === skill && heatmapFilter.jobProfileId === profile.id
                            const clickable = pct !== null
                            return (
                              <TableCell key={profile.id} className="text-center">
                                <ReadinessCell
                                  percent={pct}
                                  selected={selected}
                                  onClick={
                                    clickable ? () => onCellClick(skill, profile.id) : undefined
                                  }
                                />
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
      {!compact && (
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Lower</span>
            <span className="inline-flex gap-0.5">
              <i className="size-3 rounded-sm bg-heat-1" aria-hidden />
              <i className="size-3 rounded-sm bg-heat-3" aria-hidden />
              <i className="size-3 rounded-sm bg-heat-5" aria-hidden />
            </span>
            <span>Higher readiness</span>
          </div>
          <Button type="button" variant="link" className="h-auto p-0 text-forest" render={<Link to="/competencies" />}>
            Open benchmarks
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
