import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { currentPublishedVersion } from "@/domain/selectors"
import { adviseCoachee } from "@/lib/manager-advisor"
import { meetsTarget } from "@/domain/proficiency"
import type { PersonRecord } from "@/domain/types"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { TeamStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

export function CoacheeProfileSheet({
  person,
  open,
  onOpenChange,
}: {
  person: PersonRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { benchmarkVersions, reportCards } = useWorkspace()

  const advice = useMemo(() => {
    if (!person) return null
    const version = currentPublishedVersion(benchmarkVersions, person.competencyCode, person.jobProfileId)
    return adviseCoachee(person, reportCards, version)
  }, [person, benchmarkVersions, reportCards])

  const metCount = person?.skills.filter((s) => meetsTarget(s.assessedProficiency, s.targetProficiency)).length ?? 0
  const gapCount = advice?.gaps.length ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full overflow-y-auto border-l border-border/80 bg-background p-0 sm:max-w-[28rem]"
        aria-describedby={person ? "coachee-profile-deck" : undefined}
      >
        {person && advice && (
          <article className="flex flex-col">
            <header className="border-b border-border/80 px-6 pb-6 pt-2">
              <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Coachee profile</p>
              <SheetTitle className="font-heading mt-2 text-2xl font-semibold leading-tight tracking-tight">
                {person.name}
              </SheetTitle>
              <SheetDescription id="coachee-profile-deck" className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {getJobProfile(person.jobProfileId)?.label ?? person.role} · {person.progress}% through the current
                cycle · checkpoint {person.due}
              </SheetDescription>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TeamStatusBadge status={person.status} />
                {person.urgent && (
                  <span className="text-xs font-medium text-[var(--grove-attention)]">Urgent</span>
                )}
              </div>
            </header>

            <div className="flex flex-col gap-8 px-6 py-6">
              <section>
                <h2 className="font-heading text-sm font-semibold tracking-tight">Where they are</h2>
                <p className="mt-2 text-sm leading-[1.65] text-foreground/90">{advice.observation}</p>
                <blockquote className="mt-4 border-l-2 border-forest/35 pl-4 text-sm leading-relaxed text-muted-foreground">
                  Current focus: <span className="text-foreground">{person.focus}</span>
                </blockquote>
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
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{advice.evidence}</p>
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
                <h2 className="font-heading text-sm font-semibold tracking-tight">Suggested next step</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{advice.suggestedAction}</p>
                <div className="mt-5 flex flex-col gap-2">
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
                    variant="outline"
                    size="sm"
                    className="h-9 justify-start border-border/80"
                    onClick={() => toast.success("1:1 scheduled", { description: person.name })}
                  >
                    Schedule 1:1
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
                    Read full report card
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
