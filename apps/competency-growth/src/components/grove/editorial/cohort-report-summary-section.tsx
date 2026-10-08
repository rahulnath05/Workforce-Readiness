import { Link } from "react-router-dom"

function FigureNote({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-heading text-2xl font-semibold tabular-nums tracking-tight">{value}</dd>
      <dd className="mt-0.5 text-[10px] text-muted-foreground">{note}</dd>
    </div>
  )
}

export function CohortReportSummarySection({
  summary,
  pullQuote,
  stats,
}: {
  summary: string
  pullQuote: string
  stats: {
    headcount: number
    atRisk: number
    readinessLabel: string
    avgProgress: number
    onTrack: number
  }
}) {
  return (
    <section aria-labelledby="cohort-summary-heading" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
      <div className="min-w-0">
        <h2 id="cohort-summary-heading" className="font-heading text-lg font-semibold tracking-tight">
          Summary finding
        </h2>
        <p className="mt-3 max-w-prose text-base leading-[1.65] text-foreground/90">{summary}</p>
        <blockquote className="mt-6 border-l-2 border-forest/40 pl-5 text-base leading-relaxed text-foreground">
          {pullQuote}
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/reports" className="font-medium text-forest underline-offset-4 hover:underline">
            Open workforce reports
          </Link>
          {" "}to compare this cohort with other job profiles.
        </p>
      </div>
      <aside className="border-t border-border/70 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" aria-label="Key figures">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Margin notes</p>
        <dl className="mt-4 space-y-5">
          <FigureNote label="Learners" value={String(stats.headcount)} note="Job profile cohort" />
          <FigureNote label="Readiness" value={stats.readinessLabel} note="Vs benchmark" />
          <FigureNote label="Avg. progress" value={`${stats.avgProgress}%`} note="Cycle completion" />
          <FigureNote label="On track" value={String(stats.onTrack)} note="Steady status" />
          <FigureNote label="At risk" value={String(stats.atRisk)} note="Behind or flagged" />
        </dl>
      </aside>
    </section>
  )
}
