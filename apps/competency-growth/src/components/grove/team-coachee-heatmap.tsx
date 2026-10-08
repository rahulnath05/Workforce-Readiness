import { useMemo } from "react"
import { cn } from "cn"

import { meetsTarget, proficiencyIndex } from "@/domain/proficiency"
import type { PersonRecord } from "@/domain/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
function gapPercent(assessed: PersonRecord["skills"][0]["assessedProficiency"], target: PersonRecord["skills"][0]["targetProficiency"]) {
  const a = proficiencyIndex(assessed)
  const t = proficiencyIndex(target)
  if (t <= 0) return 0
  return Math.min(100, Math.round((a / t) * 100))
}

export function TeamCoacheeHeatmap({
  people,
  onCellClick,
}: {
  people: PersonRecord[]
  onCellClick?: (personId: string, skill: string) => void
}) {
  const skills = useMemo(() => {
    const names = new Set<string>()
    for (const person of people) {
      for (const s of person.skills) names.add(s.skill)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [people])

  if (!people.length || !skills.length) {
    return null
  }

  return (
    <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">Team skill snapshot</CardTitle>
        <CardDescription>
          Skills on your coachees&apos; benchmarks only — tap a gap to focus that person in the next step.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-[7rem] bg-card">Skill</TableHead>
              {people.map((p) => (
                <TableHead key={p.id} className="min-w-[3.25rem] px-1 text-center text-[10px] font-medium">
                  <span className="line-clamp-2" title={p.name}>{p.initials}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill}>
                <TableCell className="sticky left-0 z-10 bg-card text-sm font-medium">{skill}</TableCell>
                {people.map((person) => {
                  const row = person.skills.find((s) => s.skill === skill)
                  if (!row) {
                    return (
                      <TableCell key={person.id} className="px-1 text-center text-muted-foreground">
                        —
                      </TableCell>
                    )
                  }
                  const met = meetsTarget(row.assessedProficiency, row.targetProficiency)
                  const pct = gapPercent(row.assessedProficiency, row.targetProficiency)
                  const label = met
                    ? `${person.name}: ${skill} at target`
                    : `${person.name}: ${row.assessedProficiency} vs ${row.targetProficiency} target`

                  return (
                    <TableCell key={person.id} className="px-1 text-center">
                      <button
                        type="button"
                        title={label}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-md text-[10px] font-medium tabular-nums transition-colors",
                          met && "bg-forest/15 text-forest",
                          !met && pct >= 50 && "bg-heat-3/80 text-forest-deep",
                          !met && pct < 50 && "bg-heat-2 text-forest-deep",
                          onCellClick && !met && "hover:ring-2 hover:ring-step/50",
                        )}
                        disabled={!onCellClick || met}
                        onClick={() => onCellClick?.(person.id, skill)}
                        aria-label={label}
                      >
                        {met ? "✓" : pct}
                      </button>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
