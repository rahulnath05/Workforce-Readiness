import { Button } from "@/components/ui/button"

export function BenchmarkCatalogueArticleHeader({
  competencyName,
  owner,
  published,
  total,
  searchActive,
  onNewBenchmark,
  onExport,
}: {
  competencyName: string
  owner?: string
  published: number
  total: number
  searchActive?: string
  onNewBenchmark: () => void
  onExport: () => void
}) {
  return (
    <header className="border-b border-border/80 pb-8">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Benchmark catalogue</p>
      <h1 className="font-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-[2.125rem]">
        {competencyName}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {published} of {total} job profiles carry a published benchmark
        {owner ? ` · owned by ${owner}` : ""}.
        {searchActive ? (
          <>
            {" "}
            Showing profiles matching <span className="font-medium text-foreground">“{searchActive}”</span>.
          </>
        ) : (
          " Expand any row for skill targets and cohort evidence, or start the guided journey to publish or update a profile."
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Button type="button" onClick={onNewBenchmark}>Start benchmark journey</Button>
        <Button type="button" variant="outline" onClick={onExport}>Export catalogue</Button>
        {published < total && (
          <p className="text-xs text-muted-foreground sm:ml-auto">
            {total - published} profile{total - published === 1 ? "" : "s"} still need a benchmark
          </p>
        )}
      </div>
    </header>
  )
}
