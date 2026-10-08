import { meetsTarget } from "@/domain/proficiency"
import type {
  BenchmarkVersion,
  Cohort,
  CompetencyRecord,
  HeatmapFilter,
  JobProfile,
  Persona,
  PersonaMeta,
  PersonRecord,
  PersonStatus,
  ReportCardRecord,
  RoleLevel,
  TaxonomyNode,
} from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { getJobProfile, getJobProfiles, totalProfilesForCompetency } from "@/fixtures/designation-matrix"
import { findCohortByJobProfile } from "@/domain/cohort-model"
import { getProfileHeadcount } from "@/fixtures/benchmark-templates"
import { LEADER_OWNED_COMPETENCY_CODES, TAXONOMY_SKILLS } from "@/fixtures/taxonomy"

export function isPracticeScope(scopeNodeId: string, nodes: TaxonomyNode[]) {
  const node = nodes.find((n) => n.id === scopeNodeId)
  return node?.kind === "practice"
}

export function competencyCodesInScope(
  scopeNodeId: string,
  nodes: TaxonomyNode[],
  competencies: CompetencyRecord[],
): string[] {
  const node = nodes.find((n) => n.id === scopeNodeId)
  if (!node) return competencies.map((c) => c.code)
  if (node.kind === "practice") {
    const childCodes = nodes
      .filter((n) => n.parentId === scopeNodeId && n.competencyCode)
      .map((n) => n.competencyCode!)
    return childCodes.length ? childCodes : competencies.map((c) => c.code)
  }
  if (node.competencyCode) return [node.competencyCode]
  return competencies.map((c) => c.code)
}

export function canLeaderEditCompetency(code: string, scopeNodeId: string, nodes: TaxonomyNode[]) {
  if (isPracticeScope(scopeNodeId, nodes)) return false
  return LEADER_OWNED_COMPETENCY_CODES.includes(code as (typeof LEADER_OWNED_COMPETENCY_CODES)[number])
}

export function filterPeopleInScope(
  people: PersonRecord[],
  scopeCodes: string[],
  extra?: HeatmapFilter,
) {
  return people.filter((person) => {
    if (!scopeCodes.includes(person.competencyCode)) return false
    if (extra?.role && person.role !== extra.role) return false
    if (extra?.jobProfileId && person.jobProfileId !== extra.jobProfileId) return false
    if (extra?.skill) {
      const s = person.skills.find((x) => x.skill === extra.skill)
      if (!s) return false
      if (meetsTarget(s.assessedProficiency, s.targetProficiency)) return false
    }
    return true
  })
}

export function readinessPercentForCell(
  people: PersonRecord[],
  competencyCode: string,
  skill: string,
  role: RoleLevel,
  jobProfileId?: string,
): number {
  const relevant = people.filter(
    (p) =>
      p.competencyCode === competencyCode &&
      p.role === role &&
      (!jobProfileId || p.jobProfileId === jobProfileId) &&
      p.skills.some((s) => s.skill === skill),
  )
  if (!relevant.length) return 0
  const atTarget = relevant.filter((p) => {
    const s = p.skills.find((x) => x.skill === skill)
    return s && meetsTarget(s.assessedProficiency, s.targetProficiency)
  }).length
  return Math.round((atTarget / relevant.length) * 100)
}

export function currentPublishedVersion(
  versions: BenchmarkVersion[],
  competencyCode: string,
  jobProfileId: string,
) {
  return versions.find(
    (v) => v.competencyCode === competencyCode && v.jobProfileId === jobProfileId && v.status === "Published",
  )
}

export function formatVersionLabel(version: BenchmarkVersion) {
  const profile = getJobProfile(version.jobProfileId)
  const label = profile?.label ?? version.jobProfileId
  return `v${version.version} · ${label} · ${version.role}`
}

export function heatmapSkillRows(competencyCode: string, versions: BenchmarkVersion[]): string[] {
  const taxonomy = TAXONOMY_SKILLS[competencyCode] ?? []
  const fromVersions = new Set<string>()
  versions
    .filter((v) => v.competencyCode === competencyCode && v.status === "Published")
    .forEach((v) => {
      v.skills.forEach((s) => fromVersions.add(s.name))
    })
  const extra = [...fromVersions].filter((s) => !taxonomy.includes(s))
  return [...taxonomy, ...extra]
}

export interface HeatmapProfileGroup {
  designation: RoleLevel
  profiles: JobProfile[]
}

export function heatmapProfileGroups(competencyCode: string): HeatmapProfileGroup[] {
  return ROLE_LEVELS.map((designation) => ({
    designation,
    profiles: getJobProfiles(competencyCode, designation),
  })).filter((g) => g.profiles.length > 0)
}

export function readinessPercentForProfileSkill(
  people: PersonRecord[],
  competencyCode: string,
  jobProfileId: string,
  skill: string,
  version?: BenchmarkVersion,
): number | null {
  if (!version) return null
  const benchmarkTarget = version.skills.find((s) => s.name === skill)
  if (!benchmarkTarget) return null

  const relevant = people.filter(
    (p) =>
      p.competencyCode === competencyCode &&
      p.jobProfileId === jobProfileId &&
      p.skills.some((s) => s.skill === skill),
  )
  if (!relevant.length) return null

  const atTarget = relevant.filter((p) => {
    const assessed = p.skills.find((x) => x.skill === skill)
    return assessed && meetsTarget(assessed.assessedProficiency, benchmarkTarget.targetProficiency)
  }).length
  return Math.round((atTarget / relevant.length) * 100)
}

export function profileCoverage(competencyCode: string, versions: BenchmarkVersion[]) {
  const total = totalProfilesForCompetency(competencyCode)
  const published = new Set(
    versions.filter((v) => v.competencyCode === competencyCode && v.status === "Published").map((v) => v.jobProfileId),
  ).size
  return { published, total }
}

export function overallReadinessForProfile(
  people: PersonRecord[],
  competencyCode: string,
  jobProfileId: string,
  version?: BenchmarkVersion,
): number | null {
  if (!version || !version.skills.length) return null

  const members = people.filter(
    (p) => p.competencyCode === competencyCode && p.jobProfileId === jobProfileId,
  )
  if (!members.length) return 0

  const memberScores: number[] = []
  for (const person of members) {
    let met = 0
    let total = 0
    for (const target of version.skills) {
      const assessed = person.skills.find((s) => s.skill === target.name)
      if (!assessed) continue
      total++
      if (meetsTarget(assessed.assessedProficiency, target.targetProficiency)) met++
    }
    if (total > 0) memberScores.push(Math.round((met / total) * 100))
  }

  if (!memberScores.length) return 0
  return Math.round(memberScores.reduce((s, n) => s + n, 0) / memberScores.length)
}

export interface ProfileCatalogueRow {
  profile: JobProfile
  version?: BenchmarkVersion
  cohort?: Cohort
  memberCount: number
  atRiskCount: number
  avgReadinessPct: number
  overallReadinessPct: number | null
  leadName: string
  publishStatus: "Published" | "Not published"
}

export function orgReadinessFromCatalogue(rows: ProfileCatalogueRow[]): number | null {
  const eligible = rows.filter((r) => r.overallReadinessPct !== null && r.memberCount > 0)
  if (!eligible.length) return null
  const weighted = eligible.reduce(
    (acc, r) => acc + (r.overallReadinessPct ?? 0) * r.memberCount,
    0,
  )
  const members = eligible.reduce((s, r) => s + r.memberCount, 0)
  return members ? Math.round(weighted / members) : null
}

export function buildProfileCatalogue(
  competencyCode: string,
  versions: BenchmarkVersion[],
  cohorts: Cohort[],
  people: PersonRecord[],
): ProfileCatalogueRow[] {
  return getJobProfiles(competencyCode).map((profile) => {
    const version = currentPublishedVersion(versions, competencyCode, profile.id)
    const cohort = findCohortByJobProfile(cohorts, profile.id)
    const members = people.filter((p) => p.competencyCode === competencyCode && p.jobProfileId === profile.id)
    const atRisk = members.filter((p) => p.status === "Behind" || p.urgent || p.status === "Failed").length
    const avgReadinessPct = members.length
      ? Math.round(members.reduce((s, p) => s + p.progress, 0) / members.length)
      : 0
    const lead = cohort ? people.find((p) => p.id === cohort.leadPersonId) : undefined
    const headcount = getProfileHeadcount(profile.id, competencyCode)
    const rawReadiness = overallReadinessForProfile(
      people,
      competencyCode,
      profile.id,
      version,
    )
    const overallReadinessPct = version ? (rawReadiness ?? 0) : null
    const atRiskCount = members.length
      ? Math.round((atRisk / members.length) * headcount)
      : 0
    return {
      profile,
      version,
      cohort,
      memberCount: headcount,
      atRiskCount,
      avgReadinessPct,
      overallReadinessPct,
      leadName: lead?.name ?? "Unassigned",
      publishStatus: version ? "Published" : "Not published",
    }
  })
}

export interface CohortAggregate {
  cohort: Cohort
  memberCount: number
  atRiskCount: number
  avgReadinessPct: number
  leadName: string
}

export function aggregateCohorts(
  cohorts: Cohort[],
  people: PersonRecord[],
  competencyCodes: string[],
): CohortAggregate[] {
  return cohorts
    .filter((c) => competencyCodes.includes(c.competencyCode))
    .map((cohort) => {
      const members = people.filter((p) => p.cohortId === cohort.id)
      const atRisk = members.filter((p) => p.status === "Behind" || p.urgent || p.status === "Failed").length
      const avg =
        members.length
          ? Math.round(members.reduce((s, p) => s + p.progress, 0) / members.length)
          : 0
      const lead = people.find((p) => p.id === cohort.leadPersonId)
      return {
        cohort,
        memberCount: members.length,
        atRiskCount: atRisk,
        avgReadinessPct: avg,
        leadName: lead?.name ?? "Unassigned",
      }
    })
}

export function getManagerRecordId(persona: Persona, personas: PersonaMeta[]): string | undefined {
  if (persona !== "manager") return undefined
  return personas.find((p) => p.id === "manager")?.recordId
}

function reportRiskScore(person: PersonRecord): number {
  if (person.urgent) return 0
  if (person.status === "Behind" || person.status === "Failed") return 1
  if (person.status === "On track") return 2
  return 3
}

export function directReports(people: PersonRecord[], managerRecordId: string): PersonRecord[] {
  return people
    .filter((p) => p.managerId === managerRecordId)
    .sort((a, b) => reportRiskScore(a) - reportRiskScore(b) || a.name.localeCompare(b.name))
}

export interface TeamSummaryStats {
  total: number
  onTrack: number
  behind: number
  completed: number
  failed: number
  avgProgress: number
  pendingReportCards: number
  urgentCount: number
}

export function teamSummaryStats(
  reports: PersonRecord[],
  reportCards: ReportCardRecord[],
): TeamSummaryStats {
  const countBy = (status: PersonStatus) => reports.filter((p) => p.status === status).length
  const reportIds = new Set(reports.map((p) => p.id))
  const pendingReportCards = reportCards.filter(
    (rc) => reportIds.has(rc.personId) && rc.reviewStatus === "awaiting",
  ).length
  const avgProgress =
    reports.length ? Math.round(reports.reduce((s, p) => s + p.progress, 0) / reports.length) : 0

  return {
    total: reports.length,
    onTrack: countBy("On track"),
    behind: countBy("Behind"),
    completed: countBy("Completed"),
    failed: countBy("Failed"),
    avgProgress,
    pendingReportCards,
    urgentCount: reports.filter((p) => p.urgent).length,
  }
}
