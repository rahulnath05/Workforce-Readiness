import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { DataFrame } from "@/components/data-frame"
import { JourneyMap } from "@/components/grove/journey/journey-map"
import { JourneyPreparationCard, JourneyTaskShell } from "@/components/grove/journey/journey-task-shell"
import { StatCard } from "@/components/grove/stat-card"
import { TeamStatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import type { PersonRecord } from "@/domain/types"
import { currentPublishedVersion, teamSummaryStats } from "@/domain/selectors"
import { awaitingReviews } from "@/domain/report-aggregates"
import { proficiencyIndex } from "@/domain/proficiency"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { adviseCoachee, summarizeTeam, teamAnalytics } from "@/lib/manager-advisor"
import { TeamCoacheeHeatmap } from "@/components/grove/team-coachee-heatmap"

const JOURNEY_DRAFT_KEY = "grove-manager-team-review-draft"

const MAP_STEPS = [
  { id: 1, label: "Review team", description: "Roster and cycle health" },
  { id: 2, label: "Spot risk", description: "Exceptions and heatmap" },
  { id: 3, label: "Intervene", description: "Nudge or 1:1" },
  { id: 4, label: "Track progress", description: "Team analytics" },
  { id: 5, label: "Review outcomes", description: "Report cards" },
] as const

const STEP_COPY: Record<number, { title: string; purpose: string; effort?: string }> = {
  1: {
    title: "How is your team doing this cycle?",
    purpose:
      "Competency leaders published role benchmarks; your coachees assess skills, follow learning plans, and close with report cards. Start with a quick read of the roster.",
    effort: "3 minutes",
  },
  2: {
    title: "Who may need extra support?",
    purpose:
      "Focus on coachees who are behind, urgent, or below target on shared skills. The heatmap shows patterns—you do not need to fix everything today.",
    effort: "4 minutes",
  },
  3: {
    title: "Take a concrete coaching action",
    purpose:
      "Pick one coachee and send a timely nudge or book a 1:1. Small, specific interventions work better than broad reminders.",
    effort: "2 minutes",
  },
  4: {
    title: "Check team-level progress",
    purpose:
      "See completion outlook and shared skill bottlenecks before your next staff meeting or weekly review.",
    effort: "2 minutes",
  },
  5: {
    title: "Close the loop on outcomes",
    purpose:
      "Review report cards awaiting sign-off so coachees get clear feedback and can finish the cycle with confidence.",
    effort: "3 minutes",
  },
}

function atRiskPeople(reports: PersonRecord[]) {
  return reports.filter((p) => p.urgent || p.status === "Behind" || p.status === "Failed")
}

/** Consistent vertical rhythm between journey step panels */
const stepSections = "flex flex-col gap-6"

export function ManagerOverview() {
  const navigate = useNavigate()
  const {
    preview,
    setPreview,
    directReports,
    benchmarkVersions,
    reportCards,
  } = useWorkspace()

  const [step, setStep] = useState(1)
  const [completedThrough, setCompletedThrough] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [meetPerson, setMeetPerson] = useState<PersonRecord | null>(null)
  const [meetNote, setMeetNote] = useState("")
  const [journeyComplete, setJourneyComplete] = useState(false)

  const stats = useMemo(() => teamSummaryStats(directReports, reportCards), [directReports, reportCards])
  const teamBrief = useMemo(
    () => summarizeTeam(directReports, stats, benchmarkVersions, MVP_COMPETENCY_CODE),
    [directReports, stats, benchmarkVersions],
  )
  const analytics = useMemo(() => teamAnalytics(directReports, stats), [directReports, stats])

  const selected = useMemo(
    () => directReports.find((p) => p.id === selectedId) ?? null,
    [directReports, selectedId],
  )

  const coacheeAdvice = useMemo(() => {
    if (!selected) return null
    const version = currentPublishedVersion(benchmarkVersions, selected.competencyCode, selected.jobProfileId)
    return adviseCoachee(selected, reportCards, version)
  }, [selected, benchmarkVersions, reportCards])

  const atRisk = useMemo(() => atRiskPeople(directReports), [directReports])

  const coacheeIds = useMemo(() => new Set(directReports.map((p) => p.id)), [directReports])
  const reviewQueue = useMemo(
    () => awaitingReviews(reportCards.filter((c) => coacheeIds.has(c.personId))),
    [reportCards, coacheeIds],
  )

  useEffect(() => {
    const raw = sessionStorage.getItem(JOURNEY_DRAFT_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw) as { step?: number; completedThrough?: number; selectedId?: string }
      if (draft.step) setStep(Math.min(5, Math.max(1, draft.step)))
      if (draft.completedThrough != null) setCompletedThrough(draft.completedThrough)
      if (draft.selectedId) setSelectedId(draft.selectedId)
    } catch {
      sessionStorage.removeItem(JOURNEY_DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    if (step === 3 && !selectedId && atRisk.length) {
      setSelectedId(atRisk[0].id)
    }
  }, [step, selectedId, atRisk])

  function saveDraftAndExit() {
    sessionStorage.setItem(
      JOURNEY_DRAFT_KEY,
      JSON.stringify({ step, completedThrough, selectedId }),
    )
    toast.success("Progress saved", { description: "Resume your team review from Overview when you're ready." })
    navigate("/people")
  }

  function goNext() {
    setCompletedThrough((prev) => Math.max(prev, step))
    if (step >= 5) {
      setJourneyComplete(true)
      sessionStorage.removeItem(JOURNEY_DRAFT_KEY)
      return
    }
    setStep((s) => s + 1)
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  if (directReports.length === 0) {
    return (
      <Card className="mx-auto max-w-lg rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle>No coachees assigned</CardTitle>
          <CardDescription>
            Direct reports appear when HR assigns managerId and competency leaders publish role benchmarks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => setPreview("ready")}>Refresh</Button>
        </CardContent>
      </Card>
    )
  }

  if (journeyComplete) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Review complete</p>
        <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight">You&apos;re caught up for now</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {stats.total} coachees · {stats.pendingReportCards} report card
          {stats.pendingReportCards === 1 ? "" : "s"} still open · {atRisk.length} may need follow-up
        </p>
        <ul className="mt-8 space-y-3 border-t border-border/70 pt-6">
          <li className="border-l-2 border-forest/30 pl-4">
            <p className="text-sm font-medium">Team snapshot</p>
            <p className="text-sm text-muted-foreground">{teamBrief.summary}</p>
          </li>
          <li className="border-l-2 border-forest/30 pl-4">
            <p className="text-sm font-medium">Recommended next</p>
            <p className="text-sm text-muted-foreground">{teamBrief.recommendation}</p>
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button type="button" className="bg-forest hover:bg-forest/90" onClick={() => { setJourneyComplete(false); setStep(1) }}>
            Run review again
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/reports")}>
            Open team reports
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/people")}>
            Coachee directory
          </Button>
        </div>
      </div>
    )
  }

  const copy = STEP_COPY[step]
  const map = (
    <JourneyMap
      steps={[...MAP_STEPS]}
      currentStep={step}
      completedThrough={completedThrough}
    />
  )

  return (
    <>
      <DataFrame
        preview={preview}
        onRetry={() => setPreview("ready")}
        skeleton={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}
        emptyTitle="No coachees assigned"
        emptyBody="Direct reports appear when HR assigns managerId and competency leaders publish role benchmarks."
        emptyAction="Refresh"
        onEmptyAction={() => setPreview("ready")}
        errorMessage="Couldn’t load team progress."
      >
        <JourneyTaskShell
          title={copy.title}
          purpose={copy.purpose}
          effortLabel={copy.effort}
          stepIndex={step}
          stepTotal={MAP_STEPS.length}
          onSaveAndExit={saveDraftAndExit}
          headerLink={{ to: "/people", label: "Coachee directory" }}
          mobileProgress={map}
          contextRail={map}
          footer={
            <>
              <Button type="button" variant="outline" disabled={step <= 1} onClick={goBack}>
                Back
              </Button>
              <div className="flex flex-wrap gap-2">
                {step === 5 && reviewQueue.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => navigate("/reports")}>
                    Full reports
                  </Button>
                )}
                <Button
                  type="button"
                  className="bg-forest hover:bg-forest/90"
                  disabled={step === 3 && !selectedId}
                  onClick={goNext}
                >
                  {step >= 5 ? "Finish review" : "Continue"}
                </Button>
              </div>
            </>
          }
        >
          {step === 1 && (
            <StepReviewTeam stats={stats} reports={directReports} teamBrief={teamBrief} />
          )}
          {step === 2 && (
            <StepSpotRisk
              atRisk={atRisk}
              reports={directReports}
              onSelect={(id) => setSelectedId(id)}
              onSkillGap={(personId) => setSelectedId(personId)}
            />
          )}
          {step === 3 && (
            <StepIntervene
              reports={directReports}
              atRisk={atRisk}
              selectedId={selectedId}
              onSelect={setSelectedId}
              advice={coacheeAdvice}
              selected={selected}
              onNudge={(p) => toast.success("Nudge sent", { description: p.name })}
              onMeet={(p) => {
                setMeetNote(`Check in on ${p.focus} before ${p.due}.`)
                setMeetPerson(p)
              }}
              onReportCard={(id) => navigate(`/people/${id}/report-card`)}
            />
          )}
          {step === 4 && <StepTrackProgress analytics={analytics} stats={stats} />}
          {step === 5 && (
            <StepReviewOutcomes
              queue={reviewQueue}
              people={directReports}
              onOpenCard={(id) => navigate(`/people/${id}/report-card`)}
            />
          )}
        </JourneyTaskShell>
      </DataFrame>

      <Dialog open={!!meetPerson} onOpenChange={(o) => !o && setMeetPerson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule 1:1</DialogTitle>
            <DialogDescription>
              {meetPerson?.name} · {meetPerson?.role} · saved for this session only
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="meet-note">Agenda note</Label>
            <Textarea id="meet-note" value={meetNote} onChange={(e) => setMeetNote(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMeetPerson(null)}>Cancel</Button>
            <Button
              type="button"
              onClick={() => {
                toast.success("1:1 scheduled", { description: meetPerson?.name })
                setMeetPerson(null)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function StepReviewTeam({
  stats,
  reports,
  teamBrief,
}: {
  stats: ReturnType<typeof teamSummaryStats>
  reports: PersonRecord[]
  teamBrief: ReturnType<typeof summarizeTeam>
}) {
  return (
    <div className={stepSections}>
      <JourneyPreparationCard title="What you are reviewing">
        Benchmarks are set by competency leaders. Your coachees move through assessment, learning, and
        re-assessment—you monitor progress and step in when plans stall.
      </JourneyPreparationCard>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <StatCard label="Coachees" value={String(stats.total)} hint="Direct reports" tone="dark" />
        <StatCard label="On track" value={`${stats.onTrack}/${stats.total}`} hint="This cycle" />
        <StatCard label="Avg. progress" value={`${stats.avgProgress}%`} hint="Team average" />
        <StatCard label="Report cards" value={String(stats.pendingReportCards)} hint="Awaiting you" />
      </div>
      <CheckpointSummary title="Team read" body={teamBrief.summary} evidence={teamBrief.evidence} />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Roster</CardTitle>
          <CardDescription>All coachees in this review cycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {reports.map((member) => (
            <CoacheeRow key={member.id} member={member} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function StepSpotRisk({
  atRisk,
  reports,
  onSelect,
  onSkillGap,
}: {
  atRisk: PersonRecord[]
  reports: PersonRecord[]
  onSelect: (id: string) => void
  onSkillGap: (personId: string) => void
}) {
  return (
    <div className={stepSections}>
      <JourneyPreparationCard title="How to use this step">
        Prioritize coachees marked urgent or behind. Use the heatmap to spot skills that affect multiple people—those
        are good topics for team office hours or targeted nudges.
      </JourneyPreparationCard>
      {atRisk.length === 0 ? (
        <RecoveryPanel
          title="No exceptions right now"
          body="Everyone is on track or has completed. You can still scan the heatmap for early dips before the next checkpoint."
        />
      ) : (
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">Needs attention</CardTitle>
            <CardDescription>{atRisk.length} coachee{atRisk.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {atRisk.map((member) => (
              <button
                key={member.id}
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
                onClick={() => onSelect(member.id)}
              >
                <CoacheeRow member={member} />
              </button>
            ))}
          </CardContent>
        </Card>
      )}
      <TeamCoacheeHeatmap
        people={reports}
        onCellClick={(personId) => onSkillGap(personId)}
      />
    </div>
  )
}

function StepIntervene({
  reports,
  atRisk,
  selectedId,
  onSelect,
  selected,
  advice,
  onNudge,
  onMeet,
  onReportCard,
}: {
  reports: PersonRecord[]
  atRisk: PersonRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
  selected: PersonRecord | null
  advice: ReturnType<typeof adviseCoachee> | null
  onNudge: (p: PersonRecord) => void
  onMeet: (p: PersonRecord) => void
  onReportCard: (id: string) => void
}) {
  const pool = atRisk.length ? atRisk : reports

  return (
    <div className={stepSections}>
      <JourneyPreparationCard title="Choose one coachee">
        {advice?.suggestedAction ?? "Select someone below, then send a nudge or schedule time to talk."}
      </JourneyPreparationCard>
      <div className="space-y-2" role="radiogroup" aria-label="Coachee for intervention">
        {pool.map((member) => {
          const active = member.id === selectedId
          return (
            <button
              key={member.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                active ? "border-step/50 bg-step/10" : "hover:bg-muted/40"
              }`}
              onClick={() => onSelect(member.id)}
            >
              <CoacheeRow member={member} />
            </button>
          )
        })}
      </div>
      {selected && advice && (
        <CheckpointSummary
          title={`Coaching note · ${selected.name}`}
          body={advice.observation}
          evidence={advice.evidence}
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onNudge(selected)}>
              Send nudge
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onMeet(selected)}>
              Schedule 1:1
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-forest hover:bg-forest/90"
              onClick={() => onReportCard(selected.id)}
            >
              View report card
            </Button>
          </div>
        </CheckpointSummary>
      )}
    </div>
  )
}

function StepTrackProgress({
  analytics,
  stats,
}: {
  analytics: ReturnType<typeof teamAnalytics>
  stats: ReturnType<typeof teamSummaryStats>
}) {
  return (
    <div className={stepSections}>
      <CheckpointSummary title="Progress snapshot" body={analytics.summary} evidence={`${stats.avgProgress}% average cycle progress`} />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <StatCard label="Completion outlook" value={`${analytics.completionRate}%`} hint="On track + completed" tone="dark" />
        <StatCard label="On track" value={String(stats.onTrack)} hint={`of ${stats.total}`} />
        <StatCard label="Behind" value={String(stats.behind)} hint="Coaching window" />
        <StatCard label="Failed" value={String(stats.failed)} hint="Cycle ended" />
      </div>
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">Shared bottlenecks</CardTitle>
          <CardDescription>Skills where multiple coachees miss target</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.bottlenecks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shared gaps detected—individual follow-ups may still help.</p>
          ) : (
            analytics.bottlenecks.map((b) => (
              <div key={b.skill} className="flex justify-between gap-3 text-sm">
                <span className="font-medium">{b.skill}</span>
                <span className="text-muted-foreground">
                  {b.atRiskCount}/{b.total} below target ({b.ratePct}%)
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StepReviewOutcomes({
  queue,
  people,
  onOpenCard,
}: {
  queue: ReturnType<typeof awaitingReviews>
  people: PersonRecord[]
  onOpenCard: (personId: string) => void
}) {
  return (
    <div className={stepSections}>
      <JourneyPreparationCard title="Report cards">
        Sign-off confirms outcomes with your coachee. Comments stay visible to competency leaders for portfolio
        reporting.
      </JourneyPreparationCard>
      {queue.length === 0 ? (
        <RecoveryPanel
          title="Nothing waiting on you"
          body="When coachees complete a cycle, their report cards will appear here and in Reports."
        />
      ) : (
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Awaiting your review</CardTitle>
            <CardDescription>{queue.length} report card{queue.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {queue.map((card) => {
              const person = people.find((p) => p.id === card.personId)
              return (
                <div
                  key={card.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{person?.name ?? card.personId}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.verdict} · {card.summary} · {card.date}
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => onOpenCard(card.personId)}>
                    Review
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CoacheeRow({ member }: { member: PersonRecord }) {
  const profile = getJobProfile(member.jobProfileId)
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback style={{ background: member.tint }}>{member.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-medium">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {profile?.label ?? member.role} · {member.focus} · {member.progress}%
        </p>
      </div>
      <TeamStatusBadge status={member.status} />
    </div>
  )
}

function CheckpointSummary({
  title,
  body,
  evidence,
  className,
  children,
}: {
  title: string
  body: string
  evidence?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`rounded-lg border border-border/80 bg-card px-4 py-4 ${className ?? ""}`}>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{body}</p>
      {evidence && <p className="mt-2 text-xs text-muted-foreground">{evidence}</p>}
      {children}
    </div>
  )
}

function RecoveryPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
