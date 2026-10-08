import { Button } from "@/components/ui/button"

export function PopulationArticleHeader({
  scopeLabel,
  filterLabel,
  peopleCount,
  searchActive,
  onManageCohorts,
  onOpenReports,
}: {
  scopeLabel: string
  filterLabel: string
  peopleCount: number
  searchActive?: string
  onManageCohorts: () => void
  onOpenReports: () => void
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">People directory</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        Competency population
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{filterLabel}</span> for {scopeLabel} —{" "}
        <span className="font-medium text-foreground">
          {peopleCount} learner{peopleCount === 1 ? "" : "s"}
        </span>
        {searchActive ? (
          <>
            {" "}
            matching <span className="font-medium text-foreground">“{searchActive}”</span>
          </>
        ) : (
          " in the current competency scope. Open a profile for skill evidence, cohort placement, and report cards."
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" onClick={onManageCohorts}>Create profile cohort</Button>
        <Button type="button" variant="outline" onClick={onOpenReports}>Workforce reports</Button>
      </div>
    </header>
  )
}
