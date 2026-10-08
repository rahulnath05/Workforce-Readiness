import { useState } from "react"
import { toast } from "sonner"

import { Journey, StatCard } from "@/components/aptora"
import { DataFrame, type Preview } from "@/components/data-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageIntro } from "@/screens/leader-screens"
import { bottlenecks, contentHealth } from "@/fixtures"

const steps = [
  { label: "Map content", hint: "Link training", state: "done" as const },
  { label: "Validate links", hint: "URL, LTI, SCORM", state: "current" as const },
  { label: "Monitor health", hint: "Completion & pass", state: "later" as const },
  { label: "Find bottlenecks", hint: "Low pass skills", state: "later" as const },
  { label: "Recommend", hint: "Tell leaders", state: "later" as const },
]

type Health = (typeof contentHealth)[number]["health"]

export function LdHome({
  preview,
  onRetry,
  query,
}: {
  preview: Preview
  onRetry: () => void
  query: string
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("Foundational statistics")
  const [rows, setRows] = useState(contentHealth)
  const visible = rows.filter((row) => `${row.resource} ${row.skill}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        kicker="Program operations"
        title="Good morning, Priya."
        body="Track content quality, organization-wide outcomes and skill bottlenecks."
        primary="Map content"
        onPrimary={() => setOpen(true)}
      />
      <Journey persona="L&D Team" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={onRetry}
        skeleton={<div className="h-80 animate-pulse rounded-2xl bg-muted" />}
        emptyTitle="No training mapped"
        emptyBody="Skills in the taxonomy have no internal or public links yet."
        emptyAction="Map content"
        onEmptyAction={() => setOpen(true)}
        errorMessage="Aptora couldn’t validate training links for Data Analytics."
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Active programs" value="14" hint="6 competencies" />
          <StatCard label="Completion rate" value="76%" hint="+4.2% this quarter" tone="dark" />
          <StatCard label="First-time pass" value="68%" hint="Across 2,146 attempts" />
          <StatCard label="Content issues" value="12" hint="5 broken · 7 outdated" />
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="rounded-2xl shadow-none xl:col-span-3">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Content health</CardTitle>
                <CardDescription>Resources requiring validation or action</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>Map content</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((row) => (
                    <TableRow key={row.resource}>
                      <TableCell>
                        <span className="font-medium">{row.resource}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{row.updated}</span>
                      </TableCell>
                      <TableCell>{row.skill}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell><HealthBadge health={row.health} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-none xl:col-span-2">
            <CardHeader>
              <CardTitle>Bottleneck skills</CardTitle>
              <CardDescription>Lowest pass rate across the organization</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {bottlenecks.map((item, index) => (
                <div key={item.skill}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{index + 1}. {item.skill}</span>
                    <span className="tabular-nums">{item.rate}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-destructive/70" style={{ width: `${item.rate}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.learners}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Recommendation: add foundational statistics content before the first assessment retry.
              </p>
              <Button type="button" variant="link" className="h-auto self-start px-0" onClick={() => toast.success("Note sent to Ananya Rao about Statistical analysis")}>
                Notify competency leader
              </Button>
            </CardContent>
          </Card>
        </div>
      </DataFrame>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Map content</DialogTitle>
            <DialogDescription>Attach a training link to Statistical analysis. The course stays in the LMS.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content-title">Title</Label>
            <Input id="content-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setRows((current) => [
                  { resource: title, skill: "Statistics", source: "Internal SCORM", health: "Healthy", updated: "Validated May 22" },
                  ...current,
                ])
                setOpen(false)
                toast.success(`${title} published to the catalog`)
              }}
            >
              Publish mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HealthBadge({ health }: { health: Health }) {
  if (health === "Healthy") return <Badge variant="secondary">Healthy</Badge>
  if (health === "Broken") return <Badge variant="destructive">Broken</Badge>
  return <Badge variant="outline">{health}</Badge>
}

export function ContentLibrary({ query }: { query: string }) {
  const rows = contentHealth.filter((row) => row.resource.toLowerCase().includes(query.toLowerCase()))
  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <CardTitle>Content library</CardTitle>
        <CardDescription>Links only. Aptora does not host the training.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.resource}>
                <TableCell className="font-medium">{row.resource}</TableCell>
                <TableCell>{row.skill}</TableCell>
                <TableCell>{row.source}</TableCell>
                <TableCell>{row.health}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
