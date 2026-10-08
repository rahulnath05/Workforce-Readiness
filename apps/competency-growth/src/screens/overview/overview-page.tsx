import { useWorkspace } from "@/app/WorkspaceProvider"
import { CandidateOverview } from "@/screens/overview/candidate-overview"
import { LdOverview } from "@/screens/overview/ld-overview"
import { LeaderOverview } from "@/screens/leader/leader-overview"
import { ManagerOverview } from "@/screens/overview/manager-overview"

export function OverviewPage() {
  const { persona } = useWorkspace()
  if (persona === "leader") return <LeaderOverview />
  if (persona === "candidate") return <CandidateOverview />
  if (persona === "manager") return <ManagerOverview />
  return <LdOverview />
}
