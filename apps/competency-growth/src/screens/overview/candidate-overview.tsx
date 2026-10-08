import { useState } from "react"
import { toast } from "sonner"
import { CheckIcon } from "lucide-react"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { Journey } from "@/components/grove/journey"
import { PageIntro } from "@/components/grove/page-intro"
import { StatCard } from "@/components/grove/stat-card"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/app-name"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { planItems } from "@/fixtures/shared"

const steps = [
  { label: "Initial assessment", hint: "Measure skill", state: "done" as const },
  { label: "Gap analysis", hint: "Vs. benchmark", state: "done" as const },
  { label: "Learning plan", hint: "Close the gap", state: "current" as const },
  { label: "Re-assessment", hint: "After the section", state: "later" as const },
  { label: "Report card", hint: "Share outcome", state: "later" as const },
]

export function CandidateOverview() {
  const { preview, setPreview, searchQuery } = useWorkspace()
  const [assessOpen, setAssessOpen] = useState(false)
  const items = planItems.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="My development plan"
        title="Keep going, Aarav."
        lede="You’re making strong progress toward your Senior Associate benchmark."
        primary="Continue learning"
        onPrimary={() => setAssessOpen(true)}
      />
      <Journey title="Current journey · Candidate" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<div className="grid gap-4 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}</div>}
        emptyTitle="No benchmark assigned"
        emptyBody="Your Senior Associate plan appears after a competency leader publishes the role benchmark."
        emptyAction="Check again"
        onEmptyAction={() => setPreview("ready")}
        errorMessage={`${APP_NAME} couldn’t load Aarav Mehta’s Data Analytics plan.`}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Plan progress" value="68%" hint="On track · 18 days remaining" tone="dark" />
          <StatCard label="Skills met" value="3/6" hint="SQL met after reassessment" />
          <StatCard label="Learning time" value="14.5h" hint="2.5 hours this week" />
          <StatCard label="Next checkpoint" value="Python" hint="Re-assessment after section 3">
            <Button type="button" variant="link" className="h-auto px-0 text-forest" onClick={() => setAssessOpen(true)}>
              View details
            </Button>
          </StatCard>
        </div>
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading">Your learning plan</CardTitle>
            <CardDescription>Data Analytics · Senior Associate · Benchmark v3.3</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div key={item.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 ${item.status === "Resume" ? "border-step/40" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs ${item.status === "Done" ? "bg-forest text-white" : "bg-muted"}`}>
                    {item.status === "Done" ? <CheckIcon className="size-3.5" /> : index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">{item.source} · {item.duration}</span>
                  </span>
                </div>
                {item.status === "Resume" ? (
                  <Button type="button" size="sm" onClick={() => setAssessOpen(true)}>Resume</Button>
                ) : (
                  <span className="text-xs text-muted-foreground">{item.status === "Done" ? "Done" : item.status}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </DataFrame>
      <Dialog open={assessOpen} onOpenChange={setAssessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Python re-assessment</DialogTitle>
            <DialogDescription>Adaptive IRT · target Advanced</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => { setAssessOpen(false); toast.success("Re-assessment passed") }}>
              Submit answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
