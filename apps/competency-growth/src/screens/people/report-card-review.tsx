import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { ReportCardArticleHeader } from "@/components/grove/editorial/report-card-article-header"
import { meetsTarget } from "@/domain/proficiency"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { reportCardNarrative, verdictCaption } from "@/lib/report-card-narrative"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ReportCardReviewPage() {
  const navigate = useNavigate()
  const { personId } = useParams()
  const { people, reportCards, reviewReportCard, persona } = useWorkspace()
  const person = people.find((p) => p.id === personId)
  const card = useMemo(
    () => reportCards.find((r) => r.personId === personId),
    [reportCards, personId],
  )
  const [comment, setComment] = useState("")

  useEffect(() => {
    setComment(card?.leaderComment ?? "")
  }, [card?.id, card?.leaderComment])

  const backTo = "/people"
  const backLabel = persona === "manager" ? "Coachee register" : "People"

  if (!person || !card) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <p className="font-heading text-lg font-semibold">Report card not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This learner may not have a closed cycle yet, or the link is out of date.
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => navigate(backTo)}>
          {backLabel}
        </Button>
      </div>
    )
  }

  const profileLabel = getJobProfile(person.jobProfileId)?.label ?? person.role
  const narrative = reportCardNarrative(person, card)
  const metCount = narrative.met.length
  const totalSkills = person.skills.length

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-12 pb-16">
      <ReportCardArticleHeader
        personName={person.name}
        profileLabel={profileLabel}
        card={card}
        backTo={backTo}
        backLabel={backLabel}
      />

      <section aria-labelledby="outcome-heading" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-10">
        <div>
          <h2 id="outcome-heading" className="font-heading text-lg font-semibold tracking-tight">Narrative outcome</h2>
          <p className="mt-3 max-w-prose text-base leading-[1.65] text-foreground/90">{narrative.outcome}</p>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted-foreground">{verdictCaption(card.verdict)}</p>
        </div>
        <aside className="border-t border-border/70 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" aria-label="Cycle figures">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Margin notes</p>
          <dl className="mt-4 space-y-5">
            <div>
              <dt className="text-[11px] text-muted-foreground">Skills at target</dt>
              <dd className="mt-0.5 font-heading text-2xl font-semibold tabular-nums">{metCount}/{totalSkills}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Cycle progress</dt>
              <dd className="mt-0.5 font-heading text-2xl font-semibold tabular-nums">{person.progress}%</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Verdict</dt>
              <dd className="mt-0.5 text-sm font-medium">{card.verdict}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section aria-labelledby="strengths-heading" className="border-t border-border/80 pt-10">
        <h2 id="strengths-heading" className="font-heading text-lg font-semibold tracking-tight">Strengths</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">{narrative.strengths}</p>
      </section>

      <section aria-labelledby="gaps-heading" className="border-t border-border/80 pt-10">
        <h2 id="gaps-heading" className="font-heading text-lg font-semibold tracking-tight">Gaps & evidence</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{narrative.gapLine}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <caption className="mb-3 text-left text-[11px] text-muted-foreground">
              Assessed proficiency vs benchmark target · {person.competencyCode}
            </caption>
            <thead>
              <tr className="border-b border-border/80 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                <th className="pb-2 pr-4 font-medium">Skill</th>
                <th className="pb-2 pr-4 font-medium">Assessed</th>
                <th className="pb-2 pr-4 font-medium">Target</th>
                <th className="pb-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {person.skills.map((s) => {
                const met = meetsTarget(s.assessedProficiency, s.targetProficiency)
                return (
                  <tr key={s.skill} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{s.skill}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.assessedProficiency}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.targetProficiency}</td>
                    <td className="py-3 text-muted-foreground">{met ? "Met" : "Gap"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="signoff-heading" className="border-t border-border/80 pt-10">
        <h2 id="signoff-heading" className="font-heading text-lg font-semibold tracking-tight">Your sign-off</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {narrative.nextStep}
        </p>
        <div className="mt-6 max-w-prose">
          <Label htmlFor="manager-comment" className="text-xs text-muted-foreground">
            Comment for {person.name} and competency leaders
          </Label>
          <Textarea
            id="manager-comment"
            className="mt-2 min-h-[7rem] resize-y border-border/80 bg-[var(--grove-surface-subtle)]/30"
            placeholder="Recognition, expectations for reassessment, or escalation context…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-6">
          <Button type="button" className="bg-forest hover:bg-forest/90" onClick={() => reviewReportCard(card.id, "approved", comment)}>
            Approve outcome
          </Button>
          <Button type="button" variant="outline" onClick={() => reviewReportCard(card.id, "commented", comment)}>
            Save comment
          </Button>
          <Button type="button" variant="outline" onClick={() => reviewReportCard(card.id, "escalated", comment)}>
            Escalate
          </Button>
          {persona === "manager" && (
            <Button type="button" variant="ghost" onClick={() => navigate("/reports")}>
              Team reports
            </Button>
          )}
        </div>
      </section>
    </article>
  )
}
