import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SAVED_REPORTS } from "@/fixtures/reports"

export function ReportsPage() {
  const navigate = useNavigate()
  const { persona, cohorts, competencies, reportCards, scopeCodes, taxonomyNodes, scopeNodeId } = useWorkspace()
  const [cohortFilter, setCohortFilter] = useState<string>("all")
  const [competencyFilter, setCompetencyFilter] = useState<string>("all")

  const scopeLabel = taxonomyNodes.find((n) => n.id === scopeNodeId)?.label ?? "Portfolio"

  const awaiting = useMemo(
    () => reportCards.filter((c) => c.reviewStatus === "awaiting"),
    [reportCards],
  )

  if (persona !== "leader") {
    return (
      <PageIntro
        eyebrow="Outcomes"
        title="Reports"
        lede="Switch to Competency Leader persona for competency-scoped outcome packs."
      />
    )
  }

  const filteredCohorts = cohorts.filter(
    (c) => (competencyFilter === "all" || c.competencyCode === competencyFilter) && (cohortFilter === "all" || c.id === cohortFilter),
  )

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow={`Outcomes & reporting · ${scopeLabel}`}
        title="Competency outcomes"
        lede="Benchmark effectiveness, role-level outcomes and cohort risk — filters apply to panels below."
        secondary="Export board pack"
        onSecondary={() => toast.success("Board pack queued", { description: "PDF generating" })}
      />
      <div className="flex flex-wrap gap-2">
        <Select value={competencyFilter} onValueChange={(v) => v && setCompetencyFilter(v)}>
          <SelectTrigger className="w-44" aria-label="Competency filter">
            <SelectValue placeholder="Competency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competencies</SelectItem>
            {competencies.filter((c) => scopeCodes.includes(c.code)).map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cohortFilter} onValueChange={(v) => v && setCohortFilter(v)}>
          <SelectTrigger className="w-44" aria-label="Cohort filter">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Successful" value="64%" hint="of 412 closed plans" tone="dark" />
        <StatCard label="Partial" value="27%" hint="111 plans closed on expiry" />
        <StatCard label="Failed" value="9%" hint="37 plans need follow-up" />
        <StatCard label="Proficiency vs target" value="63%" hint="scoped skills" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Outcome by role level</CardTitle>
            <CardDescription>Success rate of closed plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[["Associate", 78], ["Sr. Associate", 71], ["Manager", 64], ["Sr. Manager", 55], ["Director", 48]].map(([role, pct]) => (
              <div key={role} className="flex items-center gap-2 text-sm">
                <span className="w-28">{role}</span>
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-forest" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums">{pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">At-risk cohorts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredCohorts.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted-foreground">{c.designationLevel}</div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => navigate(`/cohorts/${c.id}`)}>
                  Open pack
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">Report cards awaiting review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {awaiting.map((card) => (
            <div key={card.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <div className="font-medium">{card.competency}</div>
                <div className="text-muted-foreground">{card.verdict} · {card.summary}</div>
              </div>
              <Button type="button" size="sm" onClick={() => navigate(`/people/${card.personId}/report-card`)}>
                Review
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">Saved reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {SAVED_REPORTS.map(([title, meta]) => (
            <div key={title} className="flex justify-between border-b border-border/60 py-2 last:border-0">
              <span>{title}</span>
              <span className="text-muted-foreground">{meta}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
