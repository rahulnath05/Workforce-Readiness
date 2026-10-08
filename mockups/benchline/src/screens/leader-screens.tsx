import { useState } from "react"
import { toast } from "sonner"

import { HeatCell, Journey, MomentumChart, StatCard } from "@/components/aptora"
import { DataFrame, type Preview } from "@/components/data-frame"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { competencies, heatmap, heatmapRoles, heatmapSkills, watchlist } from "@/fixtures"

const steps = [
  { label: "Define benchmark", hint: "Set role targets", state: "done" as const },
  { label: "Validate taxonomy", hint: "Match skill library", state: "done" as const },
  { label: "Publish & assign", hint: "Notify people", state: "current" as const },
  { label: "Monitor readiness", hint: "Live progress", state: "later" as const },
  { label: "Review outcomes", hint: "Report cards", state: "later" as const },
]

export function LeaderHome({
  preview,
  onRetry,
  query,
}: {
  preview: Preview
  onRetry: () => void
  query: string
}) {
  const [open, setOpen] = useState(false)
  const [competency, setCompetency] = useState("Data Analytics")
  const people = watchlist.filter((person) =>
    `${person.name} ${person.focus}`.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        kicker="Competency portfolio"
        title="Good morning, Ananya."
        body="Monitor readiness, benchmark health and outcomes across your competency."
        primary="Create benchmark"
        onPrimary={() => setOpen(true)}
      />
      <Journey persona="Competency Leader" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={onRetry}
        skeleton={<OverviewSkeleton />}
        emptyTitle="No competency is live yet"
        emptyBody="Publish a benchmark to see readiness, learners, and the skill heatmap."
        emptyAction="Create benchmark"
        onEmptyAction={() => setOpen(true)}
        errorMessage="Aptora couldn’t load the Data Analytics portfolio. The last refresh was May 21, 4:10 PM."
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Overall proficiency" value="72%" hint="↑ 8.4% vs. last quarter" tone="dark" bars={[35, 48, 42, 60, 55, 72, 68, 80]} />
          <StatCard label="Active learners" value="184" hint="+12 this month · 16% of assigned people" />
          <StatCard label="Skills met" value="1,248" hint="+84 in the last 30 days · 63% of targeted skills" />
          <StatCard label="Need attention" value="24" hint="8 overdue across 4 competencies">
            <Button type="button" variant="link" className="h-auto px-0" onClick={() => toast("Showing 24 learners who need attention")}>
              Review learners
            </Button>
          </StatCard>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl shadow-none xl:col-span-2">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Competency heatmap</CardTitle>
                <CardDescription>Average proficiency by role and skill</CardDescription>
              </div>
              <Select value={competency} onValueChange={(value) => value && setCompetency(value)}>
                <SelectTrigger aria-label="Competency" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {competencies.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {competency === "Data Analytics" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      {heatmapRoles.map((role) => (
                        <TableHead key={role} className="text-center">{role}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heatmapSkills.map((skill, row) => (
                      <TableRow key={skill}>
                        <TableCell className="font-medium">{skill}</TableCell>
                        {heatmap[row].map((level, column) => (
                          <TableCell key={heatmapRoles[column]} className="text-center">
                            <HeatCell level={level} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {competency} has no published heatmap yet. Create a benchmark to assign it.
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Lower</span>
                {[1, 2, 3, 4, 5].map((level) => (
                  <HeatCell key={level} level={level} />
                ))}
                <span>Higher</span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Learning momentum</CardTitle>
              <CardDescription>Completions over 8 weeks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold tracking-tight">326</p>
                <p className="text-sm text-destructive">−18%</p>
              </div>
              <p className="text-xs text-muted-foreground">sections completed</p>
              <MomentumChart />
              <p className="text-xs text-muted-foreground">
                Strong momentum: Data Analytics is driving 42% of completions this month.
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="rounded-2xl shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>People to watch</CardTitle>
              <CardDescription>Prioritized by timeline risk and recent activity</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => toast("Opening the full learner list")}>
              View all people
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.name}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.role}</TableCell>
                    <TableCell>{person.focus}</TableCell>
                    <TableCell>{person.status}</TableCell>
                    <TableCell>{person.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {people.length === 0 && (
              <p className="pt-3 text-sm text-muted-foreground">No one matches “{query}”.</p>
            )}
          </CardContent>
        </Card>
      </DataFrame>
      <CreateBenchmark open={open} onOpenChange={setOpen} />
    </div>
  )
}

export function CompetencyList({ query }: { query: string }) {
  const rows = competencies.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <CardTitle>Competencies</CardTitle>
        <CardDescription>Aurne Corporation · five domains in this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competency</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Benchmark</TableHead>
              <TableHead>People</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.roles}</TableCell>
                <TableCell>{item.published}</TableCell>
                <TableCell className="tabular-nums">{item.people}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PageIntro({
  kicker,
  title,
  body,
  primary,
  onPrimary,
}: {
  kicker: string
  title: string
  body: string
  primary: string
  onPrimary: () => void
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{kicker}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => toast.success("Report exported for May 22")}>
          Export report
        </Button>
        <Button type="button" onClick={onPrimary}>{primary}</Button>
      </div>
    </div>
  )
}

function CreateBenchmark({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [python, setPython] = useState(true)
  const [sql, setSql] = useState(true)
  const [story, setStory] = useState(true)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create benchmark</DialogTitle>
          <DialogDescription>Data Analytics · Director · set the skills required at Advanced.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <SkillCheck id="py" label="Python" checked={python} onChange={setPython} />
          <SkillCheck id="sql" label="SQL" checked={sql} onChange={setSql} />
          <SkillCheck id="story" label="Data storytelling" checked={story} onChange={setStory} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false)
              toast.success("Director benchmark published. 42 people notified.")
            }}
          >
            Publish & assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SkillCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </>
  )
}

export { PageIntro }
