import { useNavigate } from "react-router-dom"
import { AlertTriangleIcon, ArrowRightIcon, UsersIcon } from "lucide-react"
import { cn } from "cn"

import { ReadinessRing } from "@/components/grove/reports/readiness-ring"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProfileCatalogueRow } from "@/domain/selectors"
import type { PersonRecord } from "@/domain/types"

export function AtRiskCohortBoard({
  rows,
  people,
}: {
  rows: ProfileCatalogueRow[]
  people: PersonRecord[]
}) {
  const navigate = useNavigate()
  const visible = rows.filter((r) => r.cohort).slice(0, 6)

  return (
    <Card className="overflow-hidden rounded-[var(--grove-radius-panel)] border-0 bg-gradient-to-b from-[var(--grove-attention-soft)]/35 to-card shadow-none ring-1 ring-[var(--grove-attention)]/15">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--grove-attention)]/15 text-[var(--grove-attention)]">
            <AlertTriangleIcon className="size-4" aria-hidden />
          </span>
          <CardTitle className="font-heading text-base">Cohorts needing attention</CardTitle>
        </div>
        <Badge variant="outline" className="tabular-nums">
          {rows.reduce((s, r) => s + r.atRiskCount, 0)} learners
        </Badge>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cohorts in scope.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((row) => {
              const readiness = row.overallReadinessPct ?? 0
              const lead = people.find((p) => p.id === row.cohort?.leadPersonId)
              const urgent = row.atRiskCount > 0 || readiness < 55
              return (
                <button
                  key={row.profile.id}
                  type="button"
                  onClick={() => row.cohort && navigate(`/cohorts/${row.cohort.id}`)}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-xl border bg-card/90 p-4 text-left shadow-sm transition-all",
                    "hover:-translate-y-0.5 hover:border-[var(--grove-attention)]/40 hover:shadow-md",
                    urgent && "border-[var(--grove-attention)]/25",
                  )}
                >
                  {urgent && (
                    <span
                      className="absolute top-3 right-3 size-2 animate-pulse rounded-full bg-[var(--grove-attention)]"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-2">
                      <p className="line-clamp-2 font-heading text-sm font-semibold leading-snug">
                        {row.cohort?.name ?? row.profile.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{row.profile.designationLevel}</p>
                    </div>
                    <ReadinessRing percent={readiness} size={52} stroke={4} className="shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {lead && (
                        <Avatar size="sm">
                          <AvatarFallback style={{ background: lead.tint, color: "var(--grove-ink)" }}>
                            {lead.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="truncate text-xs text-muted-foreground">{lead?.name ?? row.leadName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="size-3.5" aria-hidden />
                      <span className="tabular-nums">{row.memberCount}</span>
                    </div>
                  </div>
                  {row.atRiskCount > 0 && (
                    <Badge className="w-fit bg-[var(--grove-attention-soft)] text-[var(--grove-attention)] hover:bg-[var(--grove-attention-soft)]">
                      {row.atRiskCount} behind target
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs font-medium text-forest opacity-0 transition-opacity group-hover:opacity-100">
                    Open cohort pack
                    <ArrowRightIcon className="size-3.5" aria-hidden />
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {rows.length > visible.length && (
          <Button
            type="button"
            variant="link"
            className="mt-3 h-auto p-0 text-forest"
            onClick={() => navigate("/competencies")}
          >
            View all profiles
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
