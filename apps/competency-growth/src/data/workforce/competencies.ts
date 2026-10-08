import type { BenchmarkVersion, CompetencyRecord, SkillTarget } from "@/domain/types"
import { getRecommendedSkills } from "@/data/workforce/benchmark-templates"
import { getJobProfile, getJobProfiles } from "@/data/workforce/designation-matrix"

export const COMPETENCIES: CompetencyRecord[] = [
  { code: "DA", name: "Data Analytics", taxonomyId: "da", skills: 24, roles: 5, status: "Published", assigned: 248, owner: "Ananya Rao", updated: "22 May 2025", inDraft: 2 },
  { code: "CE", name: "Cloud Engineering", taxonomyId: "ms", skills: 28, roles: 5, status: "Published", assigned: 187, owner: "Ananya Rao", updated: "19 May 2025", inDraft: 1 },
  { code: "PM", name: "Product Management", taxonomyId: "ap", skills: 21, roles: 5, status: "Published", assigned: 142, owner: "Priya Deshmukh", updated: "16 May 2025", inDraft: 0 },
  { code: "DS", name: "Digital Strategy", taxonomyId: "ap", skills: 16, roles: 4, status: "Draft", assigned: 0, owner: "Priya Deshmukh", updated: "14 May 2025", inDraft: 3 },
  { code: "RC", name: "Risk & Compliance", taxonomyId: "consulting", skills: 18, roles: 6, status: "Review", assigned: 96, owner: "Ananya Rao", updated: "11 May 2025", inDraft: 2 },
  { code: "ET", name: "Emerging Technologies", taxonomyId: "et", skills: 12, roles: 3, status: "Draft", assigned: 0, owner: "Priya Deshmukh", updated: "08 May 2025", inDraft: 4 },
]

const SEED_PUBLISHED_PROFILES = [
  "da-data-analyst",
  "da-senior-data-analyst",
  "da-analytics-manager",
  "da-solution-architect",
  "da-director-da",
  "da-bi-associate",
  "da-senior-bi-analyst",
  "da-bi-team-lead",
  "da-principal-analyst",
]

export function createInitialBenchmarkVersions(): BenchmarkVersion[] {
  const versions: BenchmarkVersion[] = []
  for (const profileId of SEED_PUBLISHED_PROFILES) {
    const profile = getJobProfile(profileId)
    if (!profile) continue
    const skills = getRecommendedSkills("DA", profileId)
    versions.push({
      id: `${profileId}-v3.3`,
      competencyCode: "DA",
      jobProfileId: profileId,
      role: profile.designationLevel,
      version: "3.3",
      status: "Published",
      publishedAt: "22 May 2025",
      planWindow: "90 days",
      skills,
    })
  }
  return versions
}

export function draftSkillsForProfile(competencyCode: string, jobProfileId: string): SkillTarget[] {
  return getRecommendedSkills(competencyCode, jobProfileId).map((s) => ({ ...s }))
}

export function profilePublishCoverage(competencyCode: string, versions: BenchmarkVersion[]) {
  const total = getJobProfiles(competencyCode).length
  const published = new Set(
    versions.filter((v) => v.competencyCode === competencyCode && v.status === "Published").map((v) => v.jobProfileId),
  ).size
  return { published, total }
}
