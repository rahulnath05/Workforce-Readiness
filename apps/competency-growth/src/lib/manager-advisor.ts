import { meetsTarget } from "@/domain/proficiency"
import type { BenchmarkVersion, PersonRecord, ReportCardRecord } from "@/domain/types"
import type { TeamSummaryStats } from "@/domain/selectors"
import { formatVersionLabel } from "@/domain/selectors"
import { getJobProfile } from "@/fixtures/designation-matrix"

export function summarizeTeam(
  reports: PersonRecord[],
  stats: TeamSummaryStats,
  benchmarkVersions: BenchmarkVersion[],
  competencyCode: string,
) {
  if (!reports.length) {
    return {
      summary:
        "No direct reports are assigned to your manager scope yet. Coachees appear after competency leaders publish benchmarks and HR assigns reporting lines.",
      evidence: "0 coachees · no active cycles",
      recommendation: "Confirm roster assignments with your competency leader or L&D partner.",
    }
  }

  const urgentNames = reports.filter((p) => p.urgent).map((p) => p.name)
  const atRisk = stats.behind + stats.failed
  const published = benchmarkVersions.filter((v) => v.competencyCode === competencyCode && v.status === "Published")
  const profileLabels = new Set(reports.map((p) => getJobProfile(p.jobProfileId)?.label ?? p.jobProfileId))

  const summary =
    `${reports.length} coachees are in active Data Analytics cycles. ` +
    `${stats.onTrack} on track, ${atRisk} need attention` +
    (stats.completed ? `, and ${stats.completed} completed this cycle.` : ".") +
    (urgentNames.length
      ? ` Priority check-ins: ${urgentNames.join(", ")}.`
      : stats.pendingReportCards
        ? ` ${stats.pendingReportCards} report card${stats.pendingReportCards === 1 ? "" : "s"} await your review.`
        : "")

  const evidence = [
    `${stats.avgProgress}% average progress`,
    `${profileLabels.size} job profile${profileLabels.size === 1 ? "" : "s"} in scope`,
    `${published.length} published benchmark${published.length === 1 ? "" : "s"} for ${competencyCode}`,
    stats.urgentCount ? `${stats.urgentCount} marked urgent` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  let recommendation = "Scan the team heatmap for shared skill gaps before your next 1:1 block."
  if (stats.urgentCount) {
    recommendation = "Start with urgent coachees—schedule a 1:1 or send a nudge tied to their overdue checkpoint."
  } else if (stats.pendingReportCards) {
    recommendation = "Review awaiting report cards so learners can close the cycle with clear feedback."
  } else if (atRisk === 0) {
    recommendation = "Team is steady; use analytics to spot emerging bottlenecks across skills."
  }

  return { summary, evidence, recommendation }
}

export function adviseCoachee(
  person: PersonRecord,
  reportCards: ReportCardRecord[],
  version?: BenchmarkVersion,
) {
  const gaps = person.skills.filter((s) => !meetsTarget(s.assessedProficiency, s.targetProficiency))
  const profile = getJobProfile(person.jobProfileId)
  const card = reportCards.find((rc) => rc.personId === person.id)
  const versionLabel = version ? formatVersionLabel(version) : "Published benchmark"

  const observation =
    gaps.length === 0
      ? `${person.name} has met all assessed skills for ${profile?.label ?? person.jobProfileId} (${person.progress}% cycle progress).`
      : `${person.name} is ${person.progress}% through the ${profile?.label ?? person.jobProfileId} cycle with ${gaps.length} skill gap${gaps.length === 1 ? "" : "s"} remaining.`

  const evidence = [
    `Status: ${person.status}${person.due ? ` · due ${person.due}` : ""}`,
    `Focus: ${person.focus}`,
    gaps.length ? `Gaps: ${gaps.map((g) => g.skill).join(", ")}` : "All tracked skills at target",
    versionLabel,
    card ? `Report card: ${card.verdict} (${card.reviewStatus})` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  let suggestedAction = "Send a nudge referencing their next learning module."
  if (person.status === "Completed" || gaps.length === 0) {
    suggestedAction = card?.reviewStatus === "awaiting" ? "Open the report card and add review comments." : "Recognize completion in your next team sync."
  } else if (person.urgent || person.status === "Behind" || person.status === "Failed") {
    suggestedAction = "Schedule a 1:1 to unblock the highest-impact skill gap."
  }

  return { observation, evidence, suggestedAction, gaps }
}

export interface TeamSkillBottleneck {
  skill: string
  atRiskCount: number
  total: number
  ratePct: number
}

export function teamAnalytics(reports: PersonRecord[], stats: TeamSummaryStats) {
  const skillMap = new Map<string, { atRisk: number; total: number }>()

  for (const person of reports) {
    for (const s of person.skills) {
      const entry = skillMap.get(s.skill) ?? { atRisk: 0, total: 0 }
      entry.total++
      if (!meetsTarget(s.assessedProficiency, s.targetProficiency)) entry.atRisk++
      skillMap.set(s.skill, entry)
    }
  }

  const bottlenecks: TeamSkillBottleneck[] = [...skillMap.entries()]
    .map(([skill, { atRisk, total }]) => ({
      skill,
      atRiskCount: atRisk,
      total,
      ratePct: total ? Math.round((atRisk / total) * 100) : 0,
    }))
    .filter((b) => b.atRiskCount > 0)
    .sort((a, b) => b.ratePct - a.ratePct)
    .slice(0, 6)

  const completionRate = stats.total
    ? Math.round(((stats.completed + stats.onTrack) / stats.total) * 100)
    : 0

  return {
    completionRate,
    statusBreakdown: stats,
    bottlenecks,
    summary:
      `${completionRate}% of your team is on track or has completed their cycle. ` +
      (bottlenecks[0]
        ? `The widest gap is ${bottlenecks[0].skill} (${bottlenecks[0].ratePct}% of coachees below target).`
        : "No shared skill gaps detected across the team."),
  }
}

export function matchCoacheeQuery(query: string, reports: PersonRecord[]): string | null {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const byName = reports.find(
    (p) => p.name.toLowerCase().includes(q) || p.focus.toLowerCase().includes(q),
  )
  if (byName) return byName.id

  const bySkill = reports.find((p) => p.skills.some((s) => s.skill.toLowerCase().includes(q)))
  return bySkill?.id ?? null
}
