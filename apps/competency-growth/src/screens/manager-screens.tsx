import { useState } from "react"
import { toast } from "sonner"

import { Journey, StatCard } from "@/components/aptora"
import { APP_NAME } from "@/lib/app-name"
import { DataFrame, type Preview } from "@/components/data-frame"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageIntro } from "@/screens/leader-screens"
import { team } from "@/fixtures"

const steps = [
  { label: "Review team", hint: "Open the roster", state: "done" as const },
  { label: "Spot risk", hint: "Find who is behind", state: "current" as const },
  { label: "Intervene", hint: "Nudge or meet", state: "later" as const },
  { label: "Track progress", hint: "Weekly check", state: "later" as const },
  { label: "Review outcomes", hint: "Report cards", state: "later" as const },
]

export function ManagerHome({
  preview,
  onRetry,
  query,
}: {
  preview: Preview
  onRetry: () => void
  query: string
}) {
  const [meet, setMeet] = useState<string | null>(null)
  const [note, setNote] = useState("Check the storytelling gap before the May 28 close.")
  const rows = team.filter((person) => `${person.name} ${person.focus}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        kicker="Team readiness"
        title="Good morning, Vikram."
        body="See where the team is thriving and where timely support can help."
        primary="Schedule 1:1"
        onPrimary={() => setMeet("Meera Iyer")}
      />
      <Journey persona="People Manager" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={onRetry}
        skeleton={<div className="h-80 animate-pulse rounded-2xl bg-muted" />}
        emptyTitle="No one is in a cycle"
        emptyBody="Team progress shows up after a competency leader assigns a benchmark."
        emptyAction="Refresh roster"
        onEmptyAction={onRetry}
        errorMessage={`${APP_NAME} couldn’t load Vikram Shah’s Data Analytics team.`}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="On track" value="8" hint="67% of team" tone="dark" />
          <StatCard label="Behind" value="2" hint="Need intervention" />
          <StatCard label="Completed" value="1" hint="Kavya Nair" />
          <StatCard label="Avg. proficiency" value="71%" hint="+5% this quarter" />
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="rounded-2xl shadow-none xl:col-span-3">
            <CardHeader>
              <CardTitle>Team progress</CardTitle>
              <CardDescription>Prioritized by attention needed · Data Analytics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {rows.map((person) => (
                <div key={person.name} className="grid items-center gap-3 md:grid-cols-[1.4fr_1fr_auto_auto]">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full text-xs font-medium" style={{ background: person.tint }}>
                      {person.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{person.name}</span>
                      <span className="block text-xs text-muted-foreground">{person.role} · {person.focus}</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-forest" style={{ width: `${person.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{person.status}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => toast.success(`Nudge sent to ${person.name}`)}>
                    Nudge
                  </Button>
                </div>
              ))}
              {rows.length === 0 && <p className="text-sm text-muted-foreground">No one matches “{query}”.</p>}
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-none xl:col-span-2">
            <CardHeader>
              <CardTitle>Recommended actions</CardTitle>
              <CardDescription>Based on current team activity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Action
                title="Check in with Meera Iyer"
                body="6 days left and no activity for 9 days."
                action="Schedule 1:1"
                onClick={() => setMeet("Meera Iyer")}
              />
              <Action
                title="Recognize Kavya Nair"
                body="Completed all 6 skills above target."
                action="Open report card"
                onClick={() => toast("Kavya Nair · Success · all skills met on May 18")}
              />
              <Action
                title="Team insight"
                body="SQL pass rates improved 14% this month."
                action="View analytics"
                onClick={() => toast("SQL is the strongest skill on this team")}
              />
            </CardContent>
          </Card>
        </div>
      </DataFrame>
      <Dialog open={meet !== null} onOpenChange={(open) => !open && setMeet(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a 1:1</DialogTitle>
            <DialogDescription>{meet} · Thursday, May 22 · the note stays on their progress record.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                toast.success(`1:1 saved with ${meet}`)
                setMeet(null)
              }}
            >
              Save 1:1
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Action({
  title,
  body,
  action,
  onClick,
}: {
  title: string
  body: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{body}</p>
      <Button type="button" variant="link" className="h-auto px-0" onClick={onClick}>
        {action}
      </Button>
    </div>
  )
}
