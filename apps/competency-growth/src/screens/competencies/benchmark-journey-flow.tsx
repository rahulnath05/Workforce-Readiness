import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { JourneyMap } from "@/components/grove/journey/journey-map"
import { JourneyPreparationCard, JourneyTaskShell } from "@/components/grove/journey/journey-task-shell"
import { TaxonomySkillPicker } from "@/components/grove/taxonomy-skill-picker"
import { blockingErrors, runBenchmarkChecks } from "@/domain/benchmark-validation"
import { buildCohortForProfile, findCohortByJobProfile } from "@/domain/cohort-model"
import { formatProficiencyShort, PROFICIENCY_LEVELS } from "@/domain/proficiency"
import type { ProficiencyLevel, RoleLevel, SkillTarget } from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { getDesignationMeta, getJobProfile, getJobProfiles } from "@/fixtures/designation-matrix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const DRAFT_KEY = "grove-benchmark-journey-draft"

const MAP_STEPS = [
  { id: 1, label: "Choose profile", description: "Designation, job profile, plan window" },
  { id: 2, label: "Skill targets", description: "Proficiency per skill" },
  { id: 3, label: "Cohort lead", description: "One owner per cohort" },
  { id: 4, label: "Review", description: "Confirm before publish" },
  { id: 5, label: "Complete", description: "Outcome and next steps" },
] as const

const STEP_COPY: Record<number, { title: string; purpose: string; effort?: string }> = {
  1: {
    title: "Which job profile is this benchmark for?",
    purpose: "Pick the designation and profile your team will be measured against. You can change skills and leads in the next steps.",
    effort: "2 minutes",
  },
  2: {
    title: "Set target proficiency for each skill",
    purpose: "Adjust recommended targets or add skills from the taxonomy. Validation runs as you go—you can waive specific checks if needed.",
    effort: "5–8 minutes",
  },
  3: {
    title: "Who will own this cohort?",
    purpose: "Assign a single lead responsible for nudges, reviews, and plan follow-through for this profile cohort.",
    effort: "1 minute",
  },
  4: {
    title: "Review everything before you publish",
    purpose: "Publishing creates a new benchmark version, opens learning plans, and notifies learners. Confirm scope, targets, and lead.",
    effort: "2 minutes",
  },
}

export function BenchmarkJourneyFlow({
  initialCompetency = "DA",
  initialProfileId,
}: {
  initialCompetency?: string
  initialProfileId?: string
}) {
  const navigate = useNavigate()
  const {
    competencies,
    cohorts,
    people,
    publishBenchmark,
    draftSkillsForProfile,
    assignCohortLead,
    upsertCohort,
    benchmarkVersions,
  } = useWorkspace()

  const [step, setStep] = useState(1)
  const [published, setPublished] = useState(false)
  const [competencyCode, setCompetencyCode] = useState(initialCompetency)
  const [designation, setDesignation] = useState<RoleLevel>("Manager")
  const [jobProfileId, setJobProfileId] = useState(initialProfileId ?? "da-analytics-manager")
  const [planWindow, setPlanWindow] = useState("90 days")
  const [skills, setSkills] = useState<SkillTarget[]>([])
  const [waived, setWaived] = useState<Set<string>>(new Set())
  const [customSkill, setCustomSkill] = useState("")
  const [feed, setFeed] = useState<[string, string][]>([])

  const competency = competencies.find((c) => c.code === competencyCode)
  const profiles = useMemo(() => getJobProfiles(competencyCode, designation), [competencyCode, designation])
  const profile = getJobProfile(jobProfileId)
  const designationMeta = getDesignationMeta(designation)
  const checks = useMemo(() => runBenchmarkChecks(competencyCode, skills), [competencyCode, skills])
  const blockers = blockingErrors(checks, waived)
  const profileCohort = useMemo(
    () => findCohortByJobProfile(cohorts, jobProfileId),
    [cohorts, jobProfileId],
  )
  const addedSkillNames = useMemo(() => new Set(skills.map((s) => s.name)), [skills])

  useEffect(() => {
    const p = initialProfileId ?? getJobProfiles(initialCompetency, "Manager")[0]?.id ?? "da-data-analyst"
    const prof = getJobProfile(p)
    setCompetencyCode(initialCompetency)
    setJobProfileId(p)
    setDesignation(prof?.designationLevel ?? "Manager")
    setSkills(draftSkillsForProfile(initialCompetency, p))
    setWaived(new Set())
    setStep(1)
    setPublished(false)
  }, [initialCompetency, initialProfileId, draftSkillsForProfile])

  useEffect(() => {
    if (!profile) return
    if (!findCohortByJobProfile(cohorts, jobProfileId)) {
      upsertCohort(buildCohortForProfile(profile, "sanjay"), { silent: true })
    }
  }, [profile, jobProfileId, cohorts, upsertCohort])

  function reloadSkillsForProfile(pid: string) {
    setSkills(draftSkillsForProfile(competencyCode, pid))
    setWaived(new Set())
  }

  function saveDraftAndExit() {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step,
        competencyCode,
        designation,
        jobProfileId,
        planWindow,
        skills,
        waived: [...waived],
      }),
    )
    toast.success("Draft saved", { description: "Resume from Benchmarks when you're ready." })
    navigate("/competencies")
  }

  function runPublish() {
    if (blockers.length) return
    publishBenchmark({ competencyCode, jobProfileId, skills, planWindow, waivedCheckIds: [...waived] })
    const ver = benchmarkVersions.find((v) => v.jobProfileId === jobProfileId && v.status === "Published")
    setFeed([
      ["Benchmark published", `${profile?.label} · ${designation} · ${skills.length} skills`],
      ["Assignment engine", `Learning plans linked to ${profile?.label} benchmark`],
      ["Fan-out complete", `Learning plans opened · ${planWindow} window`],
      ["Notifications", "Email, in-app, and Teams delivered"],
      ["Version recorded", ver ? `v${ver.version} is now current` : "New version recorded"],
    ])
    setPublished(true)
    setStep(5)
    sessionStorage.removeItem(DRAFT_KEY)
  }

  if (published && step === 5) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Journey complete</p>
        <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight">Benchmark is live</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.label} · {designation} — learners can start against the new targets.
        </p>
        <ul className="mt-8 space-y-3 border-t border-border/70 pt-6">
          {feed.map(([title, body]) => (
            <li key={title} className="border-l-2 border-forest/30 pl-4">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" onClick={() => navigate("/competencies")}>Back to catalogue</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>View portfolio overview</Button>
        </div>
      </div>
    )
  }

  const copy = STEP_COPY[step]
  const completedThrough = published ? 5 : Math.max(0, step - 1)

  return (
    <JourneyTaskShell
      title={copy.title}
      purpose={copy.purpose}
      effortLabel={copy.effort}
      stepIndex={step}
      stepTotal={4}
      onSaveAndExit={saveDraftAndExit}
      contextRail={
        <JourneyMap steps={[...MAP_STEPS.slice(0, 4)]} currentStep={step} completedThrough={completedThrough} />
      }
      footer={
        <>
          <div>
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 && (
              <Button type="button" onClick={() => setStep(step + 1)}>Continue</Button>
            )}
            {step === 4 && (
              <Button type="button" disabled={blockers.length > 0} onClick={runPublish}>
                Publish & assign
              </Button>
            )}
          </div>
        </>
      }
    >
      <div className="mb-4 lg:hidden" aria-hidden>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-forest transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{MAP_STEPS[step - 1]?.label}</p>
      </div>

      {step === 1 && (
        <>
          <JourneyPreparationCard title="Before you start">
            You will define skill targets for one job profile, assign a cohort lead, and publish a version that
            opens learning plans. You can save and resume at any step.
          </JourneyPreparationCard>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Designation level</Label>
                <Select
                  value={designation}
                  onValueChange={(v) => {
                    if (!v) return
                    setDesignation(v as RoleLevel)
                    const first = getJobProfiles(competencyCode, v as RoleLevel)[0]
                    if (first) {
                      setJobProfileId(first.id)
                      reloadSkillsForProfile(first.id)
                    }
                  }}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_LEVELS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Job profile</Label>
                <Select
                  value={jobProfileId}
                  onValueChange={(v) => {
                    if (!v) return
                    setJobProfileId(v)
                    reloadSkillsForProfile(v)
                  }}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Plan window</Label>
                <Select value={planWindow} onValueChange={(v) => v && setPlanWindow(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["60 days", "90 days", "180 days"].map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Competency: {competency?.name ?? competencyCode}</p>
            </div>
            {designationMeta && (
              <div className="rounded-lg border border-border/80 bg-card p-4 text-sm">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Context</p>
                <p className="mt-2 font-medium">{designation} · {designationMeta.yoeRange}</p>
                <p className="mt-2 text-muted-foreground">{designationMeta.autonomy}</p>
              </div>
            )}
          </div>
        </>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {skills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="grid grid-cols-1 gap-2 rounded-lg border border-border/80 bg-card/50 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{skill.name}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{skill.type}</Badge>
                </div>
                <Select
                  value={skill.targetProficiency}
                  onValueChange={(v) => {
                    if (!v) return
                    const next = [...skills]
                    next[index] = { ...skill, targetProficiency: v as ProficiencyLevel }
                    setSkills(next)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40" aria-label={`Target for ${skill.name}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-self-start sm:justify-self-end"
                  onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <TaxonomySkillPicker
              competencyCode={competencyCode}
              excludeNames={addedSkillNames}
              onSelect={(skill) => {
                setSkills([
                  ...skills,
                  {
                    name: skill.name,
                    type: skill.skillType,
                    targetProficiency: "Intermediate",
                    source: "taxonomy",
                  },
                ])
              }}
            />
            <Input
              placeholder="Or type skill name"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="w-full sm:w-44"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const name = customSkill.trim()
                if (!name || skills.some((s) => s.name === name)) return
                setSkills([...skills, { name, type: "Technical", targetProficiency: "Intermediate", source: "custom" }])
                setCustomSkill("")
              }}
            >
              Add skill
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border border-border/80 p-3">
            {checks.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{c.title}</span>
                  <p className="text-xs text-muted-foreground">{c.detail}</p>
                </div>
                {c.waivable && c.level === "error" && (
                  <label className="flex shrink-0 items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={waived.has(c.id)}
                      onCheckedChange={(on) => {
                        const next = new Set(waived)
                        if (on) next.add(c.id)
                        else next.delete(c.id)
                        setWaived(next)
                      }}
                    />
                    Waive
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && profile && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{profileCohort?.name ?? `${designation} · ${profile.label}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {designation} · {profile.label}
                {profile.family ? ` · ${profile.family}` : ""}
              </p>
            </div>
            <Select
              value={profileCohort?.leadPersonId ?? ""}
              onValueChange={(v) => {
                if (!v || !profileCohort) return
                assignCohortLead(profileCohort.id, v)
              }}
            >
              <SelectTrigger className="w-full sm:w-52" aria-label="Cohort lead">
                <SelectValue placeholder="Cohort lead" />
              </SelectTrigger>
              <SelectContent>
                {people.filter((p) => p.role === "Director" || p.role === "Manager").map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 text-sm">
          <JourneyPreparationCard title="Checkpoint">
            Confirm the summary below. If anything looks off, use Back to adjust. Publishing cannot be undone without
            issuing a new version.
          </JourneyPreparationCard>
          <section className="rounded-lg border border-border/80 p-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Scope</h3>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Competency</dt>
                <dd className="font-medium">{competency?.name ?? competencyCode}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Plan window</dt>
                <dd className="font-medium">{planWindow}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Designation</dt>
                <dd className="font-medium">{designation}{designationMeta ? ` · ${designationMeta.yoeRange}` : ""}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Job profile</dt>
                <dd className="font-medium">{profile?.label}</dd>
              </div>
            </dl>
          </section>
          <section className="overflow-x-auto rounded-lg border border-border/80 p-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Skill targets</h3>
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      {s.targetProficiency}
                      <span className="ml-1 text-muted-foreground">({formatProficiencyShort(s.targetProficiency)})</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
          {blockers.length > 0 && (
            <p className="text-sm text-destructive" role="alert">
              Resolve {blockers.length} validation item(s) or waive them before publishing.
            </p>
          )}
        </div>
      )}
    </JourneyTaskShell>
  )
}
