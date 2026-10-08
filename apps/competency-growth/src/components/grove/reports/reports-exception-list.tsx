import { useNavigate } from "react-router-dom"
import { ArrowRightIcon } from "lucide-react"

import { ReadinessRing } from "@/components/grove/reports/readiness-ring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileCatalogueRow } from "@/domain/selectors"

export function ReportsExceptionList({ rows }: { rows: ProfileCatalogueRow[] }) {
  const navigate = useNavigate()
  const ranked = [...rows]
    .filter((r) => r.cohort)
    .sort((a, b) => {
      const scoreA = a.atRiskCount * 10 + (100 - (a.overallReadinessPct ?? 100))
      const scoreB = b.atRiskCount * 10 + (100 - (b.overallReadinessPct ?? 100))
      return scoreB - scoreA
    })
    .slice(0, 8)

  const totalAtRisk = rows.reduce((s, r) => s + r.atRiskCount, 0)

  return (
    <Card className="overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-border/80">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <CardTitle className="font-heading text-base">Exceptions by impact</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Ranked cohorts — highest risk first</p>
        </div>
        <Badge variant="outline" className="tabular-nums">{totalAtRisk} learners behind</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {ranked.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No cohort exceptions in this scope.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {ranked.map((row, index) => {
              const readiness = row.overallReadinessPct ?? 0
              return (
                <li key={row.profile.id}>
                  <button
                    type="button"
                    onClick={() => row.cohort && navigate(`/cohorts/${row.cohort.id}`)}
                    className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <ReadinessRing percent={readiness} size={40} stroke={3} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{row.cohort?.name ?? row.profile.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {row.profile.designationLevel} · {row.memberCount} members
                      </p>
                    </div>
                    {row.atRiskCount > 0 ? (
                      <Badge className="shrink-0 bg-[var(--grove-attention-soft)] text-[var(--grove-attention)]">
                        {row.atRiskCount} behind
                      </Badge>
                    ) : (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{readiness}%</span>
                    )}
                    <ArrowRightIcon
                      className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {rows.length > ranked.length && (
          <div className="border-t border-border/60 px-4 py-2">
            <Button type="button" variant="ghost" size="sm" className="text-forest" onClick={() => navigate("/people")}>
              View people heatmap
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
