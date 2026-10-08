import { ChevronRightIcon, DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReportsScopeBar({
  scopeLabel,
  periodLabel = "Rolling 12 weeks",
  competencyFilter,
  cohortFilter,
  onCompetencyChange,
  onCohortChange,
  competencies,
  cohorts,
  onExport,
}: {
  scopeLabel: string
  periodLabel?: string
  competencyFilter: string
  cohortFilter: string
  onCompetencyChange: (value: string) => void
  onCohortChange: (value: string) => void
  competencies: { code: string; name: string }[]
  cohorts: { id: string; name: string }[]
  onExport: () => void
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-5">
      <nav aria-label="Analytical context" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{scopeLabel}</span>
        <ChevronRightIcon className="size-3.5 opacity-50" aria-hidden />
        <span>Outcomes</span>
        <ChevronRightIcon className="size-3.5 opacity-50" aria-hidden />
        <span className="text-foreground">Reports</span>
      </nav>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-[1.75rem]">Workforce readiness</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Organization view for board review — compare roles, surface exceptions, export narrative packs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={competencyFilter} onValueChange={(v) => v && onCompetencyChange(v)}>
            <SelectTrigger className="h-9 w-[11rem] rounded-md border-border/80 bg-card text-sm" aria-label="Competency scope">
              <SelectValue placeholder="Competency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All competencies</SelectItem>
              {competencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cohortFilter} onValueChange={(v) => v && onCohortChange(v)}>
            <SelectTrigger className="h-9 w-[11rem] rounded-md border-border/80 bg-card text-sm" aria-label="Cohort scope">
              <SelectValue placeholder="Cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cohorts</SelectItem>
              {cohorts.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden h-9 items-center rounded-md border border-border/80 bg-muted/30 px-3 text-xs text-muted-foreground sm:inline-flex">
            {periodLabel}
          </span>
          <Button type="button" variant="outline" className="h-9 gap-1.5" onClick={onExport}>
            <DownloadIcon className="size-3.5" aria-hidden />
            Board pack
          </Button>
        </div>
      </div>
    </header>
  )
}
