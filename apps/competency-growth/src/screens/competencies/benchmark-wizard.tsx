import { useEffect, useMemo, useState } from "react"
import { CheckIcon } from "lucide-react"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { blockingErrors, runBenchmarkChecks } from "@/domain/benchmark-validation"
import { buildCohortForProfile, findCohortByJobProfile } from "@/domain/cohort-model"
import { formatProficiencyShort, PROFICIENCY_LEVELS } from "@/domain/proficiency"
import type { ProficiencyLevel, RoleLevel, SkillTarget } from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { getDesignationMeta, getJobProfile, getJobProfiles } from "@/fixtures/designation-matrix"
import { TAXONOMY_SKILLS } from "@/fixtures/taxonomy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

const STEPS = ["Scope", "Skill targets", "Cohort leads", "Review", "Published"] as const

const WIZARD_SHELL =
  "flex h-[min(680px,90vh)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"

export function BenchmarkWizard({
  open,
  onOpenChange,
  initialCompetency = "DA",
  initialProfileId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCompetency?: string
  initialProfileId?: string
}) {
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

  useEffect(() => {
    if (!open) return
    setStep(1)
    setPublished(false)
    setCompetencyCode(initialCompetency)
    const p = initialProfileId ?? getJobProfiles(initialCompetency, "Manager")[0]?.id ?? "da-data-analyst"
    const prof = getJobProfile(p)
    setJobProfileId(p)
    setDesignation(prof?.designationLevel ?? "Manager")
    setSkills(draftSkillsForProfile(initialCompetency, p))
    setWaived(new Set())
  }, [open, initialCompetency, initialProfileId, draftSkillsForProfile])

  useEffect(() => {
    if (!open || !profile) return
    if (!findCohortByJobProfile(cohorts, jobProfileId)) {
      upsertCohort(buildCohortForProfile(profile, "sanjay"), { silent: true })
    }
  }, [open, profile, jobProfileId, cohorts, upsertCohort])

  function reloadSkillsForProfile(pid: string) {
    setSkills(draftSkillsForProfile(competencyCode, pid))
    setWaived(new Set())
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={WIZARD_SHELL}>
        <DialogHeader className="shrink-0 gap-1 border-b px-5 py-4">
          <DialogTitle>{published ? "Benchmark published" : "New benchmark"}</DialogTitle>
          <DialogDescription className="text-xs leading-snug">
            {published
              ? `${profile?.label} · ${designation}`
              : "Designation and job profile → skill targets → cohort lead → publish"}
          </DialogDescription>
        </DialogHeader>

        <nav aria-label="Benchmark steps" className="grid shrink-0 grid-cols-5 gap-1 border-b px-3 py-3">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = published || step > n
            const on = step === n
            return (
              <div
                key={label}
                className={`flex min-w-0 flex-col items-center gap-1 text-center ${on ? "text-foreground" : "text-muted-foreground"}`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    done ? "bg-forest text-white" : on ? "bg-step text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <CheckIcon className="size-3.5" aria-hidden /> : n}
                </span>
                <span className={`max-w-full truncate text-[10px] leading-tight sm:text-[11px] ${on ? "font-semibold" : ""}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && !published && (
            <div className="grid h-full gap-5 lg:grid-cols-2">
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
              </div>
              {designationMeta && (
                <div className="rounded-[var(--grove-radius-panel)] border bg-card p-4 text-sm lg:max-h-full lg:overflow-y-auto">
                  <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Designation context</p>
                  <p className="mt-2 font-medium">{designation} · {designationMeta.yoeRange}</p>
                  <p className="mt-2 text-muted-foreground">{designationMeta.autonomy}</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs text-muted-foreground">
                    {designationMeta.coreScope.slice(0, 4).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 2 && !published && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Recommended for {profile?.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Set target proficiency per skill (B/I/A/E shorthand in tables only).
                </p>
              </div>
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
                <Select onValueChange={(v) => { if (typeof v === "string") setCustomSkill(v) }}>
                  <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Add from taxonomy" /></SelectTrigger>
                  <SelectContent>
                    {(TAXONOMY_SKILLS[competencyCode] ?? []).filter((n) => !skills.some((s) => s.name === n)).map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  className="shrink-0"
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
              <div className="space-y-2 rounded-lg border p-3">
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

          {step === 3 && !published && profile && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Each cohort is one designation and job profile. Assign a single lead for this cohort.
              </p>
              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
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

          {step === 4 && !published && (
            <div className="space-y-4 text-sm">
              <section className="rounded-lg border p-3">
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
                    <dd className="font-medium">
                      {profile?.label}
                      {profile?.family ? <span className="font-normal text-muted-foreground"> · {profile.family}</span> : null}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border p-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Skill targets</h3>
                <div className="mt-2 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead className="text-right">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skills.map((s) => (
                        <TableRow key={s.name}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.type}</TableCell>
                          <TableCell>
                            {s.targetProficiency}
                            <span className="ml-1 text-muted-foreground">({formatProficiencyShort(s.targetProficiency)})</span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{s.source ?? "recommended"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section className="rounded-lg border p-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cohort lead</h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Cohort</dt>
                    <dd className="font-medium">{profileCohort?.name ?? `${designation} · ${profile?.label}`}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Lead</dt>
                    <dd className="font-medium">
                      {people.find((p) => p.id === profileCohort?.leadPersonId)?.name ?? "Unassigned"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border p-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Validation</h3>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {checks.map((c) => {
                    const waivedCheck = waived.has(c.id)
                    const ok = c.level !== "error" || waivedCheck
                    return (
                      <li key={c.id} className={ok ? "text-muted-foreground" : "text-destructive"}>
                        {ok ? "✓" : "✗"} {c.title}
                        {waivedCheck ? " (waived)" : ""}
                      </li>
                    )
                  })}
                </ul>
              </section>

              {blockers.length > 0 && (
                <p className="text-sm text-destructive">
                  {blockers.length} blocking validation error(s) — resolve or waive before publish.
                </p>
              )}
            </div>
          )}

          {step === 5 && published && (
            <div className="space-y-2">
              {feed.map(([title, body]) => (
                <div key={title} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{title}</p>
                  <p className="text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/50 px-5 py-4">
          {step > 1 && step < 5 && !published && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 4 && !published && (
            <Button type="button" onClick={() => setStep(step + 1)}>Continue</Button>
          )}
          {step === 4 && !published && (
            <Button type="button" disabled={blockers.length > 0} onClick={runPublish}>
              Publish & assign
            </Button>
          )}
          {step === 5 && (
            <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
