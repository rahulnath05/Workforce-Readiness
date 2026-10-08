import { useWorkspace } from "@/app/WorkspaceProvider"
import { PageIntro } from "@/components/grove/page-intro"
import { LeaderReportsPage } from "@/screens/reports/leader-reports-page"
import { ManagerReportsPage } from "@/screens/reports/manager-reports-page"

export function ReportsPage() {
  const { persona } = useWorkspace()

  if (persona === "manager") {
    return <ManagerReportsPage />
  }

  if (persona === "leader") {
    return <LeaderReportsPage />
  }

  return (
    <PageIntro
      eyebrow="Outcomes"
      title="Reports"
      lede="Switch to Competency Leader for outcome packs."
    />
  )
}
