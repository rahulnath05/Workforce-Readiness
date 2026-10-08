import { Link } from "react-router-dom"

import type { ReportCardRecord, ReportVerdict } from "@/domain/types"
import { Button } from "@/components/ui/button"

const VERDICT_LABEL: Record<ReportVerdict, string> = {
  Success: "Benchmark met",
  Partial: "Partial attainment",
  Fail: "Below benchmark",
}

export function ReportCardArticleHeader({
  personName,
  profileLabel,
  card,
  backTo,
  backLabel,
}: {
  personName: string
  profileLabel: string
  card: ReportCardRecord
  backTo: string
  backLabel: string
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <nav aria-label="Report context" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to={backTo} className="hover:text-forest hover:underline">{backLabel}</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{personName}</span>
        <span aria-hidden>/</span>
        <span className="text-foreground">Report card</span>
      </nav>
      <p className="mt-4 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Review outcomes</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        {personName}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {profileLabel} · {card.competency} cycle closed {card.date}. This report summarizes assessed skills against the
        published benchmark and records your sign-off for the learner and competency leader.
      </p>
      <blockquote className="mt-6 max-w-2xl border-l-2 border-forest/40 pl-5">
        <p className="font-heading text-lg font-medium leading-snug text-foreground">
          {VERDICT_LABEL[card.verdict]}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
      </blockquote>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" variant="outline" size="sm" render={<Link to={backTo} />}>
          ← {backLabel}
        </Button>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          Review status: <span className="font-medium text-foreground">{card.reviewStatus}</span>
        </p>
      </div>
    </header>
  )
}
