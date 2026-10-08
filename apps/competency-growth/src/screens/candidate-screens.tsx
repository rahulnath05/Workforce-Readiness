import { useState } from "react"
import { toast } from "sonner"
import { CheckIcon } from "lucide-react"

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
import { PageIntro } from "@/screens/leader-screens"
import { planItems } from "@/fixtures"

const steps = [
  { label: "Initial assessment", hint: "Measure skill", state: "done" as const },
  { label: "Gap analysis", hint: "Vs. benchmark", state: "done" as const },
  { label: "Learning plan", hint: "Close the gap", state: "current" as const },
  { label: "Re-assessment", hint: "After the section", state: "later" as const },
  { label: "Report card", hint: "Share outcome", state: "later" as const },
]

export function CandidateHome({
  preview,
  onRetry,
  query,
}: {
  preview: Preview
  onRetry: () => void
  query: string
}) {
  const [assessOpen, setAssessOpen] = useState(false)
  const items = planItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        kicker="My development plan"
        title="Keep going, Aarav."
        body="You’re making strong progress toward your Senior Associate benchmark."
        primary="Continue learning"
        onPrimary={() => setAssessOpen(true)}
      />
      <Journey persona="Candidate" steps={steps} />
      <DataFrame
        preview={preview}
        onRetry={onRetry}
        skeleton={<div className="grid gap-4 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}</div>}
        emptyTitle="No benchmark assigned"
        emptyBody="Your Senior Associate plan appears after a competency leader publishes the role benchmark."
        emptyAction="Check again"
        onEmptyAction={onRetry}
        errorMessage={`${APP_NAME} couldn’t load Aarav Mehta’s Data Analytics plan.`}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard label="Plan progress" value="68%" hint="On track · 18 days remaining" tone="dark" bars={[20, 28, 36, 44, 52, 60, 68]} />
          <StatCard label="Skills met" value="3/6" hint="SQL met after reassessment" />
          <StatCard label="Learning time" value="14.5h" hint="2.5 hours this week" />
          <StatCard label="Next checkpoint" value="Python" hint="Re-assessment after section 3">
            <Button type="button" variant="link" className="h-auto px-0" onClick={() => setAssessOpen(true)}>
              View details
            </Button>
          </StatCard>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="rounded-2xl shadow-none xl:col-span-3">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Your learning plan</CardTitle>
                <CardDescription>Data Analytics · Senior Associate · Benchmark v3</CardDescription>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-forest-deep">On track</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 ${item.status === "Resume" ? "border-step/40" : ""}`}
                >
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
              {items.length === 0 && <p className="text-sm text-muted-foreground">No section matches “{query}”.</p>}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-transparent bg-forest-deep text-white shadow-none xl:col-span-2">
            <CardHeader>
              <CardDescription className="text-white/70">Up next</CardDescription>
              <CardTitle>Adaptive re-assessment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-white/80">
                The question difficulty adapts as you answer. Most assessments take 12–15 minutes.
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Meta label="Skill" value="Python" />
                <Meta label="Target" value="Advanced" />
                <Meta label="After" value="Section 3" />
              </div>
              <Button type="button" variant="secondary" onClick={() => setAssessOpen(true)}>
                View assessment details
              </Button>
            </CardContent>
          </Card>
        </div>
      </DataFrame>
      <Dialog open={assessOpen} onOpenChange={setAssessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Python re-assessment</DialogTitle>
            <DialogDescription>Section 3 · Applied data analysis · target Advanced for a Senior Associate.</DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            A client file has two rows for the same store ID. Which pandas call keeps the first row?
          </p>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setAssessOpen(false)
                toast.success("Re-assessment passed. Python is now Met.")
              }}
            >
              Submit drop_duplicates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
