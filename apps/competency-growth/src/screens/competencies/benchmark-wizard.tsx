import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

/** @deprecated Use route `/competencies/benchmark` — opens guided journey page. */
export function BenchmarkWizard({
  open,
  onOpenChange,
  initialProfileId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCompetency?: string
  initialProfileId?: string
}) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const q = new URLSearchParams()
    if (initialProfileId) q.set("profileId", initialProfileId)
    const path = q.toString() ? `/competencies/benchmark?${q}` : "/competencies/benchmark"
    onOpenChange(false)
    navigate(path)
  }, [open, initialProfileId, navigate, onOpenChange])

  return null
}
