import { TrendingUpIcon } from "lucide-react"
import { cn } from "cn"

const READINESS_TARGET = 80

export function ReportsOutcomeHero({
  readiness,
  benchmarkPublished,
  benchmarkTotal,
  atRiskTotal,
  reviewCount,
}: {
  readiness: number | null
  benchmarkPublished: number
  benchmarkTotal: number
  atRiskTotal: number
  reviewCount: number
}) {
  const value = readiness ?? 0
  const gapToTarget = readiness !== null ? value - READINESS_TARGET : null
  const onTarget = gapToTarget !== null && gapToTarget >= 0

  return (
    <section
      aria-labelledby="reports-outcome-heading"
      className="grid gap-3 lg:grid-cols-12 lg:gap-4"
    >
      <div
        className="flex flex-col justify-between rounded-[var(--grove-radius-panel)] bg-forest-deep px-5 py-5 text-white ring-1 ring-forest/20 lg:col-span-5"
      >
        <div>
          <p id="reports-outcome-heading" className="text-[11px] font-medium tracking-wide text-white/70 uppercase">
            Headline outcome
          </p>
          <p className="mt-3 font-heading text-5xl font-semibold tabular-nums tracking-tight md:text-[3.25rem]">
            {readiness !== null ? `${readiness}%` : "—"}
          </p>
          <p className="mt-2 text-sm text-white/80">Weighted competency readiness</p>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-sm">
          <div>
            <dt className="text-[10px] text-white/60 uppercase">Target</dt>
            <dd className="mt-0.5 font-semibold tabular-nums">{READINESS_TARGET}%</dd>
          </div>
          <div>
            <dt className="text-[10px] text-white/60 uppercase">Vs target</dt>
            <dd className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums">
              {gapToTarget !== null ? (
                <>
                  <TrendingUpIcon
                    className={cn("size-3.5", !onTarget && "rotate-180 text-[var(--grove-warning)]")}
                    aria-hidden
                  />
                  {gapToTarget >= 0 ? `+${gapToTarget}` : gapToTarget} pts
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
        <SupportingSignal
          label="Benchmark coverage"
          value={`${benchmarkPublished}/${benchmarkTotal}`}
          detail="Published profiles"
        />
        <SupportingSignal
          label="Learners behind"
          value={String(atRiskTotal)}
          detail="Across in-scope cohorts"
          emphasis={atRiskTotal > 0 ? "attention" : undefined}
        />
        <SupportingSignal
          label="Awaiting sign-off"
          value={String(reviewCount)}
          detail="Report cards in queue"
          emphasis={reviewCount > 0 ? "warning" : undefined}
        />
      </div>
    </section>
  )
}

function SupportingSignal({
  label,
  value,
  detail,
  emphasis,
}: {
  label: string
  value: string
  detail: string
  emphasis?: "attention" | "warning"
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-[var(--grove-radius-panel)] border border-border/80 bg-card px-4 py-4 ring-1 ring-foreground/[0.04]",
        emphasis === "attention" && "border-[var(--grove-attention)]/25 bg-[var(--grove-attention-soft)]/20",
        emphasis === "warning" && "border-[var(--grove-warning)]/25 bg-[var(--grove-warning-soft)]/15",
      )}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  )
}
