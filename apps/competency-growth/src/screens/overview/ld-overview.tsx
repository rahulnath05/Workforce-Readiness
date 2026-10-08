import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { Journey } from "@/components/grove/journey"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { coverageClass } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { bottlenecks, contentHealth } from "@/fixtures/shared"

const steps = [
  { label: "Map content", hint: "Link training", state: "done" as const },
  { label: "Validate links", hint: "URL, LTI, SCORM", state: "current" as const },
  { label: "Monitor health", hint: "Completion & pass", state: "later" as const },
  { label: "Find bottlenecks", hint: "Low pass skills", state: "later" as const },
  { label: "Recommend", hint: "Tell leaders", state: "later" as const },
]

export function LdOverview() {
  const { preview, setPreview, searchQuery, validateCompetency } = useWorkspace()
  const rows = contentHealth.filter((r) => r.resource.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Program operations"
        title="Good morning, Priya."
        lede="Track content quality, organization-wide outcomes and skill bottlenecks."
        primary="Map content"
        secondary="Validate all competencies"
        onSecondary={() => validateCompetency("DA")}
      />
      <Journey title="Program cycle · L&D Team" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}
        emptyTitle="No programme data"
        emptyBody="Content health queue populates after mapping."
        emptyAction="Refresh"
        onEmptyAction={() => setPreview("ready")}
        errorMessage="Couldn’t load programme health."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Resources mapped" value="12" hint="URL, LTI, SCORM" tone="dark" />
          <StatCard label="Healthy" value="7" hint="Passed link validation" />
          <StatCard label="Review queue" value="3" hint="Needs curator" />
          <StatCard label="Broken" value="2" hint="Blocked learners" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-base">Content health queue</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.resource}>
                      <TableCell>{row.resource}</TableCell>
                      <TableCell>{row.health}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-base">Bottleneck skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bottlenecks.map((b) => (
                <div key={b.skill} className="flex items-center gap-2 text-sm">
                  <span className="w-36">{b.skill}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${coverageClass(b.rate)}`}>{b.rate}% pass</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DataFrame>
    </div>
  )
}
