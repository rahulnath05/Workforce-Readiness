import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { Journey } from "@/components/grove/journey"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { TeamStatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { team } from "@/fixtures/shared"

const steps = [
  { label: "Review team", hint: "12 direct reports", state: "done" as const },
  { label: "Spot risk", hint: "2 need support", state: "current" as const },
  { label: "Intervene", hint: "Nudge or 1:1", state: "later" as const },
  { label: "Track progress", hint: "Weekly review", state: "later" as const },
  { label: "Review outcomes", hint: "Report cards", state: "later" as const },
]

export function ManagerOverview() {
  const { preview, setPreview, searchQuery } = useWorkspace()
  const rows = team.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Team readiness"
        title="Good morning, Vikram."
        lede="See where your team is thriving and where timely support can help."
        primary="Schedule 1:1"
        onPrimary={() => toast.success("1:1 scheduler opened")}
      />
      <Journey title="Team review · People Manager" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}
        emptyTitle="No team data"
        emptyBody="Direct reports appear when assigned to your manager scope."
        emptyAction="Refresh"
        onEmptyAction={() => setPreview("ready")}
        errorMessage="Couldn’t load team progress."
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Team on track" value="3/5" hint="This cycle" tone="dark" />
          <StatCard label="Need support" value="2" hint="Behind on benchmark" />
          <StatCard label="Avg. progress" value="70%" hint="Vs. org 63%" />
          <StatCard label="Upcoming 1:1s" value="4" hint="Next 14 days" />
        </div>
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading">Team progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((member) => (
              <div key={member.name} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback style={{ background: member.tint }}>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.focus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TeamStatusBadge status={member.status} />
                  <Button type="button" size="sm" variant="outline" onClick={() => toast.success("Nudge sent", { description: member.name })}>
                    Nudge
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </DataFrame>
    </div>
  )
}
