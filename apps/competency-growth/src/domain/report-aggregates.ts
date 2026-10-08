import type { ProfileCatalogueRow } from "@/domain/selectors"
import {
  currentPublishedVersion,
  heatmapSkillRows,
  readinessPercentForProfileSkill,
} from "@/domain/selectors"
import type { BenchmarkVersion, Cohort, PersonRecord, ReportCardRecord, RoleLevel } from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { getJobProfiles } from "@/data/workforce/designation-matrix"

export interface VerdictMix {
  success: number
  partial: number
  fail: number
  total: number
}

export function verdictMix(
  reportCards: ReportCardRecord[],
  competencyName?: string,
): VerdictMix {
  const cards = competencyName
    ? reportCards.filter((c) => c.competency === competencyName)
    : reportCards
  const counts = { success: 0, partial: 0, fail: 0 }
  for (const card of cards) {
    if (card.verdict === "Success") counts.success++
    else if (card.verdict === "Partial") counts.partial++
    else if (card.verdict === "Fail") counts.fail++
  }
  return {
    ...counts,
    total: cards.length,
  }
}

export function readinessByDesignation(
  rows: ProfileCatalogueRow[],
): { designation: RoleLevel; readinessPct: number | null; profileCount: number }[] {
  const buckets = new Map<RoleLevel, { sum: number; weight: number; profiles: number }>()

  for (const row of rows) {
    const level = row.profile.designationLevel
    const bucket = buckets.get(level) ?? { sum: 0, weight: 0, profiles: 0 }
    bucket.profiles++
    if (row.overallReadinessPct !== null && row.memberCount > 0) {
      bucket.sum += row.overallReadinessPct * row.memberCount
      bucket.weight += row.memberCount
    }
    buckets.set(level, bucket)
  }

  return ROLE_LEVELS.map((designation) => {
    const b = buckets.get(designation)
    if (!b || !b.weight) {
      return { designation, readinessPct: null, profileCount: b?.profiles ?? 0 }
    }
    return {
      designation,
      readinessPct: Math.round(b.sum / b.weight),
      profileCount: b.profiles,
    }
  }).filter((r) => r.profileCount > 0)
}

export function filterCatalogueRows(
  rows: ProfileCatalogueRow[],
  options: { cohortId?: string; cohorts: Cohort[] },
): ProfileCatalogueRow[] {
  if (!options.cohortId || options.cohortId === "all") return rows
  const cohort = options.cohorts.find((c) => c.id === options.cohortId)
  if (!cohort) return rows
  return rows.filter((r) => r.profile.id === cohort.jobProfileId)
}

export function awaitingReviews(
  reportCards: ReportCardRecord[],
  competencyName?: string,
): ReportCardRecord[] {
  const awaiting = reportCards.filter((c) => c.reviewStatus === "awaiting")
  if (!competencyName) return awaiting
  return awaiting.filter((c) => c.competency === competencyName)
}

export function atRiskCatalogueRows(rows: ProfileCatalogueRow[]): ProfileCatalogueRow[] {
  return [...rows].sort((a, b) => b.atRiskCount - a.atRiskCount)
}

export interface SkillFocusArea {
  skill: string
  readinessPct: number
}

/** Lowest-readiness skills (averaged across published profiles) — max `limit` items. */
export function skillFocusAreas(
  competencyCode: string,
  people: PersonRecord[],
  benchmarkVersions: BenchmarkVersion[],
  limit = 5,
): SkillFocusArea[] {
  const skills = heatmapSkillRows(competencyCode, benchmarkVersions)
  const profiles = getJobProfiles(competencyCode).filter((p) =>
    currentPublishedVersion(benchmarkVersions, competencyCode, p.id),
  )

  const averages: SkillFocusArea[] = []

  for (const skill of skills) {
    const samples: number[] = []
    for (const profile of profiles) {
      const version = currentPublishedVersion(benchmarkVersions, competencyCode, profile.id)
      const pct = readinessPercentForProfileSkill(
        people,
        competencyCode,
        profile.id,
        skill,
        version,
      )
      if (pct !== null) samples.push(pct)
    }
    if (!samples.length) continue
    const readinessPct = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
    averages.push({ skill, readinessPct })
  }

  return averages.sort((a, b) => a.readinessPct - b.readinessPct).slice(0, limit)
}
