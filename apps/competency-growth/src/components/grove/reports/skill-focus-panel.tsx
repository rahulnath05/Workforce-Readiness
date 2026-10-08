import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SkillFocusArea } from "@/domain/report-aggregates"
import { cn } from "@/lib/utils"

export function SkillFocusPanel({
  areas,
  onViewPeople,
}: {
  areas: SkillFocusArea[]
  onViewPeople: (skill: string) => void
}) {
  const needsWork = areas.filter((a) => a.readinessPct < 70)

  return (
    <Card className="rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-forest/10">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="font-heading text-base">Fix first</CardTitle>
        {needsWork.length > 0 && (
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {needsWork.length} skills
          </span>
        )}
      </CardHeader>
      <CardContent>
        {needsWork.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--grove-positive-soft)]/50 px-3 py-4 text-sm text-forest">
            <CheckCircle2Icon className="size-5 shrink-0" aria-hidden />
            <span className="font-medium">Skills on track</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {needsWork.map((area) => (
              <li key={area.skill}>
                <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{area.skill}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          area.readinessPct < 40 ? "bg-[var(--grove-attention)]" : "bg-step",
                        )}
                        style={{ width: `${area.readinessPct}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "w-10 shrink-0 text-right text-sm font-semibold tabular-nums",
                      area.readinessPct < 40 ? "text-[var(--grove-attention)]" : "text-foreground",
                    )}
                  >
                    {area.readinessPct}%
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="shrink-0 gap-0.5 px-2 text-forest"
                    onClick={() => onViewPeople(area.skill)}
                  >
                    People
                    <ArrowRightIcon className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
