import { cn } from "cn"

import { ReadinessRing } from "@/components/grove/reports/readiness-ring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RoleLevel } from "@/domain/types"
import { getDesignationMeta } from "@/data/workforce/designation-matrix"

type DesignationRow = {
  designation: RoleLevel
  readinessPct: number | null
  profileCount: number
}

const SHORT_LABEL: Record<RoleLevel, string> = {
  Associate: "Assoc",
  "Sr. Associate": "Sr Assoc",
  Manager: "Manager",
  "Sr. Manager": "Sr Mgr",
  Director: "Director",
}

export function DesignationReadinessOverview({
  orgReadiness,
  rows,
  onSelectDesignation,
  showOverallBadge = true,
}: {
  orgReadiness: number | null
  rows: DesignationRow[]
  onSelectDesignation: (role: RoleLevel) => void
  showOverallBadge?: boolean
}) {
  return (
    <Card className="flex w-full flex-col overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-border/80">
      <CardHeader className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-b border-border/60 py-3">
        <div className="min-w-0">
          <CardTitle className="font-heading text-base">Role comparison</CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Weighted readiness by designation — select to drill to people</p>
        </div>
        {showOverallBadge && (
          <div className="flex items-center gap-3">
            <div className="min-w-[5.5rem] rounded-lg bg-forest px-4 py-2 text-center text-white sm:min-w-[6.5rem]">
              <p className="text-xl font-semibold tabular-nums leading-none">
                {orgReadiness !== null ? `${orgReadiness}%` : "—"}
              </p>
              <p className="text-[9px] text-white/75">Overall</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {rows.map((row) => {
            const meta = getDesignationMeta(row.designation)
            const pct = row.readinessPct
            const muted = pct === null
            return (
              <button
                key={row.designation}
                type="button"
                disabled={muted}
                onClick={() => onSelectDesignation(row.designation)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-1.5 py-3 text-center shadow-sm ring-1 ring-foreground/5 transition-all",
                  !muted && "hover:border-forest/30 hover:bg-[var(--grove-positive-soft)]/40",
                  muted && "opacity-50",
                )}
              >
                {pct !== null ? (
                  <ReadinessRing percent={pct} size={52} stroke={4} theme="light" />
                ) : (
                  <span className="flex size-[52px] items-center justify-center rounded-full border border-dashed border-border text-sm text-muted-foreground">
                    —
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">{SHORT_LABEL[row.designation]}</p>
                  {meta && (
                    <p className="text-[9px] leading-tight text-muted-foreground">{meta.yoeRange}</p>
                  )}
                  <p className="text-[9px] tabular-nums text-muted-foreground">
                    {row.profileCount} profiles
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
