import { useSearchParams } from "react-router-dom"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { BenchmarkJourneyFlow } from "@/screens/competencies/benchmark-journey-flow"
import { MVP_COMPETENCY_CODE } from "@/fixtures/taxonomy"

export function BenchmarkJourneyPage() {
  const [params] = useSearchParams()
  const { scopeCodes } = useWorkspace()
  const competencyCode = scopeCodes[0] ?? MVP_COMPETENCY_CODE
  const profileId = params.get("profileId") ?? undefined

  return (
    <BenchmarkJourneyFlow initialCompetency={competencyCode} initialProfileId={profileId} />
  )
}
