import { PageIntro } from "@/components/grove/page-intro"
import { Card, CardContent } from "@/components/ui/card"

export function AssessmentLabPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Assessment lab"
        title="IRT engine workspace"
        lede="Adaptive assessment walkthrough ported from the HTML prototype — configure items, run sessions, and inspect θ/SE readouts."
      />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardContent className="py-8 text-sm text-muted-foreground">
          Full assessment lab interactions from L&DMockup will run here. Leader and candidate flows remain available via overview and people routes.
        </CardContent>
      </Card>
    </div>
  )
}
