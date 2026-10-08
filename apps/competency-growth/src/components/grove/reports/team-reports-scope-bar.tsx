import { ChevronRightIcon, DownloadIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PersonStatus } from "@/domain/types"

export type TeamStatusFilter = "all" | PersonStatus

export function TeamReportsScopeBar({
  coacheeCount,
  statusFilter,
  onStatusFilterChange,
  onExport,
}: {
  coacheeCount: number
  statusFilter: TeamStatusFilter
  onStatusFilterChange: (value: TeamStatusFilter) => void
  onExport: () => void
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-5">
      <nav aria-label="Analytical context" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Vikram Shah</span>
        <ChevronRightIcon className="size-3.5 opacity-50" aria-hidden />
        <span>Direct reports</span>
        <ChevronRightIcon className="size-3.5 opacity-50" aria-hidden />
        <span className="text-foreground">Team outcomes</span>
      </nav>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-[1.75rem]">Team readiness</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Quiet view for your {coacheeCount} coachees — headline progress, comparisons, and exceptions ready for a
            leadership check-in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => v && onStatusFilterChange(v as TeamStatusFilter)}
          >
            <SelectTrigger className="h-9 w-[10.5rem] rounded-md border-border/80 bg-card text-sm" aria-label="Status filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="On track">On track</SelectItem>
              <SelectItem value="Behind">Behind</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <span className="hidden h-9 items-center rounded-md border border-border/80 bg-muted/30 px-3 text-xs text-muted-foreground sm:inline-flex">
            May cycle · 12 weeks
          </span>
          <Button type="button" variant="outline" className="h-9 gap-1.5" onClick={onExport}>
            <DownloadIcon className="size-3.5" aria-hidden />
            Export summary
          </Button>
          <Button type="button" variant="ghost" className="h-9 text-forest" render={<Link to="/" />}>
            Team coach
          </Button>
        </div>
      </div>
    </header>
  )
}
