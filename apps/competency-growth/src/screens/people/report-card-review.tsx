import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { PageIntro } from "@/components/grove/page-intro"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function ReportCardReviewPage() {
  const navigate = useNavigate()
  const { personId } = useParams()
  const { people, reportCards, reviewReportCard } = useWorkspace()
  const person = people.find((p) => p.id === personId)
  const card = useMemo(
    () => reportCards.find((r) => r.personId === personId) ?? reportCards[0],
    [reportCards, personId],
  )
  const [comment, setComment] = useState(card?.leaderComment ?? "")

  if (!person || !card) {
    return <p className="text-sm text-muted-foreground">Report card not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Review outcomes"
        title={`Report card · ${person.name}`}
        lede={`${card.verdict} — ${card.summary}`}
      />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">{card.competency}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Closed {card.date} · Status: {card.reviewStatus}</p>
          {person.skills.map((s) => (
            <div key={s.skill} className="flex justify-between text-sm">
              <span>{s.skill}</span>
              <span>{s.assessedProficiency} / {s.targetProficiency}</span>
            </div>
          ))}
          <Textarea
            placeholder="Leader comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            aria-label="Leader comment"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => reviewReportCard(card.id, "approved", comment)}>
              Approve
            </Button>
            <Button type="button" variant="outline" onClick={() => reviewReportCard(card.id, "commented", comment)}>
              Comment
            </Button>
            <Button type="button" variant="destructive" onClick={() => reviewReportCard(card.id, "escalated", comment)}>
              Escalate
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/people")}>
              Back to people
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
