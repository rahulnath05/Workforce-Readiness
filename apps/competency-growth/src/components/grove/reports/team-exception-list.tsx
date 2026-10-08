import { useNavigate } from "react-router-dom"
import { ArrowRightIcon } from "lucide-react"

import { ReadinessRing } from "@/components/grove/reports/readiness-ring"
import { TeamStatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PersonRecord } from "@/domain/types"

function impactScore(person: PersonRecord): number {
  let score = 100 - person.progress
  if (person.status === "Failed") score += 40
  if (person.status === "Behind") score += 25
  if (person.urgent) score += 30
  return score
}

export function TeamExceptionList({
  people,
  onDrill,
}: {
  people: PersonRecord[]
  onDrill?: (id: string) => void
}) {
  const navigate = useNavigate()
  const ranked = [...people]
    .filter((p) => p.status === "Behind" || p.status === "Failed" || p.urgent)
    .sort((a, b) => impactScore(b) - impactScore(a))
    .slice(0, 6)

  const atRiskTotal = people.filter((p) => p.status === "Behind" || p.status === "Failed" || p.urgent).length

  return (
    <Card className="overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-border/80">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <CardTitle className="font-heading text-base">Exceptions by impact</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Ranked coachees — intervene before quarter close</p>
        </div>
        <Badge variant="outline" className="tabular-nums">{atRiskTotal} flagged</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {ranked.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No exceptions in the current filter.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {ranked.map((person, index) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => (onDrill ? onDrill(person.id) : navigate(`/people/${person.id}/report-card`))}
                  className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="w-6 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <ReadinessRing percent={person.progress} size={40} stroke={3} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{person.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {person.focus} · due {person.due}
                    </p>
                  </div>
                  <TeamStatusBadge status={person.status} />
                  <ArrowRightIcon
                    className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border/60 px-4 py-2">
          <Button type="button" variant="ghost" size="sm" className="text-forest" onClick={() => navigate("/people")}>
            Open coachee register
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
