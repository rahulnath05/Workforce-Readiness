import { Button } from "@/components/ui/button"

export function PortfolioArticleHeader({
  scopeLabel,
  onCreateBenchmark,
  onExport,
}: {
  scopeLabel: string
  onCreateBenchmark: () => void
  onExport: () => void
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Competency portfolio</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        Good morning, Ananya.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        This briefing covers profile health, benchmark coverage, and cohort risk for{" "}
        <span className="font-medium text-foreground">{scopeLabel}</span>—one readiness roll-up per job profile,
        not skill-by-skill grids.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" onClick={onCreateBenchmark}>Start benchmark journey</Button>
        <Button type="button" variant="outline" onClick={onExport}>Export snapshot</Button>
        <p className="text-xs text-muted-foreground sm:ml-auto">Updated May 22 · {scopeLabel}</p>
      </div>
    </header>
  )
}
