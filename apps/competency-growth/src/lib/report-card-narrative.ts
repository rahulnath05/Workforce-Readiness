import { meetsTarget } from "@/domain/proficiency"
import type { PersonRecord, ReportCardRecord, ReportVerdict } from "@/domain/types"

export function reportCardNarrative(person: PersonRecord, card: ReportCardRecord) {
  const met = person.skills.filter((s) => meetsTarget(s.assessedProficiency, s.targetProficiency))
  const gaps = person.skills.filter((s) => !meetsTarget(s.assessedProficiency, s.targetProficiency))

  const outcome =
    card.verdict === "Success"
      ? `${person.name} met or exceeded target proficiency on all tracked skills for this cycle.`
      : card.verdict === "Partial"
        ? `${person.name} reached target on ${met.length} of ${person.skills.length} skills; remaining gaps should be addressed in the next plan window.`
        : `${person.name} finished below benchmark on most skills—use this review to agree on remediation or role support.`

  const strengths =
    met.length > 0
      ? `Demonstrated strength in ${met.map((s) => s.skill).join(", ")}.`
      : "No skills at full target yet—focus the conversation on the nearest wins."

  const gapLine =
    gaps.length > 0
      ? `Still developing: ${gaps.map((s) => `${s.skill} (${s.assessedProficiency} vs ${s.targetProficiency} target)`).join("; ")}.`
      : "No open skill gaps against the published benchmark."

  let nextStep = "Approve to close the cycle and notify the learner."
  if (card.verdict === "Partial") {
    nextStep = "Comment with specific expectations for reassessment, or approve if the team accepts partial attainment."
  } else if (card.verdict === "Fail") {
    nextStep = "Escalate if remediation needs competency leader input; otherwise document a recovery plan in your comment."
  }
  if (card.reviewStatus !== "awaiting") {
    nextStep = "This card was already reviewed—you can update your comment if context changed."
  }

  return { outcome, strengths, gapLine, met, gaps, nextStep }
}

export function verdictCaption(verdict: ReportVerdict): string {
  switch (verdict) {
    case "Success":
      return "Outcome supports role readiness at the published benchmark."
    case "Partial":
      return "Meaningful progress with targeted gaps remaining."
    case "Fail":
      return "Benchmark not met—document support and next checkpoint."
  }
}
