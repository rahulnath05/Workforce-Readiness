import { Button } from "@/components/ui/button"

export function CoacheesArticleHeader({
  coacheeCount,
  searchActive,
  onTeamReview,
  onOpenReports,
}: {
  coacheeCount: number
  searchActive?: string
  onTeamReview: () => void
  onOpenReports: () => void
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Your coachees</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        Direct reports
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Competency leaders publish role benchmarks; your team assesses skills, follows learning plans, and closes
        cycles with report cards. This register lists{" "}
        <span className="font-medium text-foreground">
          {coacheeCount} coachee{coacheeCount === 1 ? "" : "s"}
        </span>
        {searchActive ? (
          <>
            {" "}
            matching <span className="font-medium text-foreground">“{searchActive}”</span>
          </>
        ) : (
          " in your manager scope."
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" onClick={onTeamReview}>Resume team review</Button>
        <Button type="button" variant="outline" onClick={onOpenReports}>Team reports</Button>
        <p className="text-xs text-muted-foreground sm:ml-auto">Data Analytics · May 22 cycle</p>
      </div>
    </header>
  )
}
