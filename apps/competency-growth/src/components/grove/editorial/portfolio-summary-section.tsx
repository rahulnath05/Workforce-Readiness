import { Link } from "react-router-dom"

export function PortfolioSummarySection({
  scopeLabel,
  orgReadiness,
  coveragePublished,
  coverageTotal,
  cohortsAtRisk,
  plansClosing,
}: {
  scopeLabel: string
  orgReadiness: number | null
  coveragePublished: number
  coverageTotal: number
  cohortsAtRisk: number
  plansClosing: number
}) {
  const readinessLine =
    orgReadiness !== null
      ? `Portfolio readiness stands at ${orgReadiness}% against published benchmarks.`
      : "Publish at least one job profile benchmark to establish a readiness baseline."

  return (
    <section aria-labelledby="portfolio-summary-heading" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
      <div className="min-w-0">
        <h2 id="portfolio-summary-heading" className="font-heading text-lg font-semibold tracking-tight">
          Summary finding
        </h2>
        <p className="mt-3 max-w-prose text-base leading-[1.65] text-foreground/90">{readinessLine}</p>
        <blockquote className="mt-6 border-l-2 border-forest/40 pl-5 text-base leading-relaxed text-foreground">
          {coveragePublished < coverageTotal
            ? `${coverageTotal - coveragePublished} job profile${coverageTotal - coveragePublished === 1 ? "" : "s"} still lack a published benchmark—coverage gaps will depress the roll-up until closed.`
            : cohortsAtRisk > 0
              ? `${cohortsAtRisk} cohort${cohortsAtRisk === 1 ? "" : "s"} show learners behind plan; review the profile table before quarter close.`
              : "Benchmark coverage is complete for in-scope profiles; focus shifts to sustaining readiness and sign-offs."}
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/reports" className="font-medium text-forest underline-offset-4 hover:underline">
            Open full metrics
          </Link>
          {" "}for export packs and exception ranking.
        </p>
      </div>
      <aside className="border-t border-border/70 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" aria-label="Key figures">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Margin notes</p>
        <dl className="mt-4 space-y-5">
          <FigureNote label="Profiles published" value={`${coveragePublished}/${coverageTotal}`} note="Live benchmarks" />
          <FigureNote label="Competency readiness" value={orgReadiness !== null ? `${orgReadiness}%` : "—"} note="Weighted roll-up" />
          <FigureNote label="Cohorts at risk" value={String(cohortsAtRisk)} note={scopeLabel} />
          <FigureNote label="Plans closing soon" value={String(plansClosing)} note="Within 14 days" />
        </dl>
      </aside>
    </section>
  )
}

function FigureNote({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-heading text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
      <dd className="mt-0.5 text-[10px] text-muted-foreground">{note}</dd>
    </div>
  )
}
