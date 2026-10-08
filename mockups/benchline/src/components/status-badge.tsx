import { Badge } from "@/components/ui/badge"
import type { SkillProgress, TeamStatus } from "@/fixtures"

export function TeamStatusBadge({ status }: { status: TeamStatus }) {
  if (status === "Completed") return <Badge>Completed</Badge>
  if (status === "On track") return <Badge variant="secondary">On track</Badge>
  if (status === "Behind") return <Badge variant="destructive">Behind</Badge>
  return <Badge variant="destructive">Failed</Badge>
}

export function SkillStatusBadge({ status }: { status: SkillProgress }) {
  if (status === "Met") return <Badge>Met</Badge>
  if (status === "Learning") return <Badge variant="secondary">Learning</Badge>
  if (status === "Assessed") return <Badge variant="outline">Assessed</Badge>
  return <Badge variant="outline">Not started</Badge>
}

export function coverageClass(percent: number) {
  if (percent >= 75) return "bg-primary/15 text-foreground"
  if (percent >= 50) return "bg-muted text-foreground"
  return "bg-destructive/10 text-destructive"
}
