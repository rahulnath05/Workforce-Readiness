import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function CohortReportArticleHeader({
  profileLabel,
  designationLevel,
  headcount,
  atRisk,
  readinessLabel,
  leadName,
  benchmarkLabel,
  onNudge,
}: {
  profileLabel: string
  designationLevel: string
  headcount: number
  atRisk: number
  readinessLabel: string
  leadName: string
  benchmarkLabel?: string
  onNudge: () => void
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <nav aria-label="Cohort context" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/people" className="hover:text-forest hover:underline">People</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Cohort report</span>
      </nav>
      <p className="mt-4 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Cohort report pack</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        {profileLabel}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {designationLevel} designation ·{" "}
        <span className="font-medium text-foreground">{headcount} learner{headcount === 1 ? "" : "s"}</span> on this job
        profile ·{" "}
        <span className={atRisk > 0 ? "font-medium text-[var(--grove-attention)]" : "font-medium text-foreground"}>
          {atRisk} at risk
        </span>
        · {readinessLabel} readiness vs published benchmark.
        {benchmarkLabel ? ` Targets from ${benchmarkLabel}.` : " Publish a benchmark to establish targets."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" onClick={onNudge}>Nudge cohort</Button>
        <Button type="button" variant="outline" render={<Link to="/competencies" />}>Benchmark catalogue</Button>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          Cohort lead <span className="font-medium text-foreground">{leadName}</span>
        </p>
      </div>
    </header>
  )
}
