import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { currentPublishedVersion } from "@/domain/selectors"
import { meetsTarget } from "@/domain/proficiency"
import type { PersonRecord } from "@/domain/types"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { TeamStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

export function PopulationProfileSheet({
  person,
  open,
  onOpenChange,
}: {
  person: PersonRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { benchmarkVersions, cohorts, assignPersonCohort } = useWorkspace()

  const version = useMemo(() => {
    if (!person) return undefined
    return currentPublishedVersion(benchmarkVersions, person.competencyCode, person.jobProfileId)
  }, [person, benchmarkVersions])

  const metCount = person?.skills.filter((s) => meetsTarget(s.assessedProficiency, s.targetProficiency)).length ?? 0
  const gapCount = person ? person.skills.length - metCount : 0
  const cohortName = person?.cohortId ? cohorts.find((c) => c.id === person.cohortId)?.name : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full overflow-y-auto border-l border-border/80 bg-background p-0 sm:max-w-[28rem]"
        aria-describedby={person ? "population-profile-deck" : undefined}
      >
        {person && (
          <article className="flex flex-col">
            <header className="border-b border-border/80 px-6 pb-6 pt-2">
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Learner profile</p>
              <SheetTitle className="font-heading mt-2 text-2xl font-semibold leading-tight tracking-tight">
                {person.name}
              </SheetTitle>
              <SheetDescription id="population-profile-deck" className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {getJobProfile(person.jobProfileId)?.label ?? person.role} · {person.progress}% through cycle · due{" "}
                {person.due}
                {cohortName ? ` · ${cohortName}` : " · Unassigned cohort"}
              </SheetDescription>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TeamStatusBadge status={person.status} />
                {person.urgent && (
                  <span className="text-xs font-medium text-[var(--grove-attention)]">Flagged urgent</span>
                )}
              </div>
            </header>

            <div className="flex flex-col gap-8 px-6 py-6">
              <section>
                <h2 className="font-heading text-sm font-semibold tracking-tight">Cycle context</h2>
                <p className="mt-2 text-sm leading-[1.65] text-foreground/90">
                  {person.focus} is the stated development focus. Benchmark targets come from{" "}
                  {version ? `published v${version.version}` : "an unpublished profile—publish in the catalogue first"}.
                </p>
              </section>

              <aside className="border-y border-border/70 py-5" aria-label="Cycle figures">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Margin notes</p>
                <dl className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-[10px] text-muted-foreground">At target</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">{metCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">Gaps</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">{gapCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-muted-foreground">Progress</dt>
                    <dd className="font-heading text-lg font-semibold tabular-nums">{person.progress}%</dd>
                  </div>
                </dl>
              </aside>

              <section>
                <h2 className="font-heading text-sm font-semibold tracking-tight">Skill evidence</h2>
                <p className="mt-1 text-xs text-muted-foreground">Assessed level vs published benchmark target</p>
                <table className="mt-4 w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/80 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 pr-2 font-medium">Skill</th>
                      <th className="pb-2 pr-2 font-medium">Level</th>
                      <th className="pb-2 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {person.skills.map((s) => {
                      const ok = meetsTarget(s.assessedProficiency, s.targetProficiency)
                      return (
                        <tr key={s.skill} className="border-b border-border/50">
                          <td className="py-2.5 pr-2 font-medium">{s.skill}</td>
                          <td className="py-2.5 pr-2 text-xs text-muted-foreground">
                            {s.assessedProficiency} / {s.targetProficiency}
                          </td>
                          <td className="py-2.5 text-xs text-muted-foreground">{ok ? "Met" : "Gap"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </section>

              <section className="border-t border-border/80 pt-6">
                <h2 className="font-heading text-sm font-semibold tracking-tight">Cohort placement</h2>
                <p className="mt-1 text-xs text-muted-foreground">One cohort per person for readiness roll-ups</p>
                <div className="mt-4">
                  <Label htmlFor="population-cohort-select" className="text-xs text-muted-foreground">Cohort</Label>
                  <Select
                    value={person.cohortId ?? ""}
                    onValueChange={(v) => assignPersonCohort(person.id, v || undefined)}
                  >
                    <SelectTrigger id="population-cohort-select" className="mt-1.5">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {cohorts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </section>

              <section className="border-t border-border/80 pt-6">
                <h2 className="font-heading text-sm font-semibold tracking-tight">Actions</h2>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 justify-start border-border/80"
                    onClick={() => toast.success("Nudge sent", { description: person.name })}
                  >
                    Send nudge
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 justify-start bg-forest hover:bg-forest/90"
                    onClick={() => {
                      onOpenChange(false)
                      navigate(`/people/${person.id}/report-card`)
                    }}
                  >
                    Open report card
                  </Button>
                </div>
              </section>
            </div>
          </article>
        )}
      </SheetContent>
    </Sheet>
  )
}
