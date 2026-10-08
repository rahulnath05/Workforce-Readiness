import { PageIntro } from "@/components/grove/page-intro"
import { Card, CardContent } from "@/components/ui/card"

export function BlueprintPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Blueprint"
        title="Competency blueprint"
        lede="Structural blueprint for competencies and skills — placeholder route included in phase 1 workspace surface."
      />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardContent className="py-8 text-sm text-muted-foreground">
          Blueprint module stub. Re-enable full blueprint canvas when porting remaining L&DMockup sections.
        </CardContent>
      </Card>
    </div>
  )
}
