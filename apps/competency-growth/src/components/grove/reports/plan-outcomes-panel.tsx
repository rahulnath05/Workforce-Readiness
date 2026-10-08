import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { VerdictMix } from "@/domain/report-aggregates"

const SEGMENTS = [
  { key: "success" as const, label: "Success", bar: "bg-forest", dot: "bg-forest" },
  { key: "partial" as const, label: "Partial", bar: "bg-[var(--grove-warning)]", dot: "bg-[var(--grove-warning)]" },
  { key: "fail" as const, label: "Fail", bar: "bg-[var(--grove-attention)]", dot: "bg-[var(--grove-attention)]" },
]

export function PlanOutcomesPanel({
  mix,
  mixPcts,
}: {
  mix: VerdictMix
  mixPcts: { success: number; partial: number; fail: number }
}) {
  return (
    <Card className="overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-forest/10">
      <CardHeader className="shrink-0 border-b border-border/50 bg-gradient-to-r from-[var(--grove-positive-soft)]/50 to-transparent pb-3">
        <CardTitle className="font-heading text-base">Plan outcomes</CardTitle>
        <p className="text-[11px] text-muted-foreground">Closed learning plans</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-4">
        {mix.total === 0 ? (
          <p className="text-center text-sm text-muted-foreground">—</p>
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-[var(--grove-neutral-soft)]">
              {SEGMENTS.map((seg) =>
                mixPcts[seg.key] > 0 ? (
                  <div
                    key={seg.key}
                    className={`${seg.bar} transition-[width]`}
                    style={{ width: `${mixPcts[seg.key]}%` }}
                    title={`${seg.label} ${mixPcts[seg.key]}%`}
                  />
                ) : null,
              )}
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {SEGMENTS.map((seg) => (
                <li
                  key={seg.key}
                  className="rounded-lg border border-border/60 bg-[var(--grove-surface-subtle)] px-2 py-2.5 text-center"
                >
                  <div className="mx-auto mb-1.5 flex items-center justify-center gap-1">
                    <span className={`size-2 rounded-full ${seg.dot}`} aria-hidden />
                    <span className="text-[10px] font-medium text-muted-foreground">{seg.label}</span>
                  </div>
                  <p className="text-xl font-semibold tabular-nums leading-none">{mixPcts[seg.key]}%</p>
                  <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">{mix[seg.key]} plans</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
