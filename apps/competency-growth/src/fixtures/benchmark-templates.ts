import type { ProficiencyLevel, RoleLevel, SkillTarget } from "@/domain/types"
import { ROLE_LEVELS } from "@/domain/types"
import { indexToProficiency } from "@/domain/proficiency"
import { getJobProfile, getJobProfiles } from "@/fixtures/designation-matrix"
import { TAXONOMY_SKILLS } from "@/fixtures/taxonomy"

const DA_MATRIX = [
  { skill: "Python", type: "Technical", targets: [2, 3, 3, 4, 4] },
  { skill: "SQL", type: "Technical", targets: [2, 3, 4, 4, 4] },
  { skill: "Data visualization", type: "Technical", targets: [1, 2, 3, 3, 4] },
  { skill: "Statistical analysis", type: "Technical", targets: [1, 2, 3, 4, 4] },
  { skill: "Data storytelling", type: "Business", targets: [2, 3, 3, 4, 4] },
]

const PROFILE_SKILL_OVERRIDES: Record<string, Partial<Record<string, ProficiencyLevel>>> = {
  "da-bi-associate": { "Data visualization": "Intermediate", SQL: "Intermediate" },
  "da-bi-analyst": { "Data visualization": "Advanced", SQL: "Advanced" },
  "da-data-architect-junior": { SQL: "Advanced", Python: "Intermediate" },
  "da-solution-architect": { SQL: "Advanced", "Statistical analysis": "Advanced" },
  "da-marketing-analyst": { "Data storytelling": "Advanced" },
  "da-financial-data-analyst": { "Statistical analysis": "Intermediate", SQL: "Advanced" },
}

export const PROFILE_AUDIENCE: Record<string, number> = {
  "da-data-analyst": 42,
  "da-bi-associate": 28,
  "da-junior-analytics-engineer": 18,
  "da-product-analyst-i": 22,
  "da-marketing-analyst": 15,
  "da-financial-data-analyst": 19,
  "da-senior-data-analyst": 31,
  "da-senior-bi-analyst": 24,
  "da-analytics-engineer-ii": 20,
  "da-data-architect-junior": 12,
  "da-bi-analyst": 26,
  "da-analytics-manager": 14,
  "da-bi-team-lead": 11,
  "da-solution-architect": 9,
  "da-principal-analyst": 8,
  "da-product-analyst": 10,
  "da-bi-architect": 7,
  "da-sr-analytics-manager": 6,
  "da-sr-solution-architect": 5,
  "da-enterprise-data-architect": 4,
  "da-data-architect": 5,
  "da-director-da": 3,
  "da-vp-bi": 2,
  "da-cdo": 1,
}

function baseProficiencyForRole(role: RoleLevel, skill: string): ProficiencyLevel {
  const row = DA_MATRIX.find((r) => r.skill === skill)
  if (!row) return "Intermediate"
  const idx = ROLE_LEVELS.indexOf(role)
  return indexToProficiency(row.targets[idx] ?? 2)
}

export function getRecommendedSkills(competencyCode: string, jobProfileId: string): SkillTarget[] {
  const profile = getJobProfile(jobProfileId)
  if (!profile || profile.competencyCode !== competencyCode) {
    const names = TAXONOMY_SKILLS[competencyCode] ?? TAXONOMY_SKILLS.DA
    return names.slice(0, 5).map((name) => ({
      name,
      type: "Technical",
      targetProficiency: "Intermediate",
      source: "recommended",
    }))
  }
  const overrides = PROFILE_SKILL_OVERRIDES[jobProfileId] ?? {}
  return DA_MATRIX.map((row) => ({
    name: row.skill,
    type: row.type,
    targetProficiency: overrides[row.skill] ?? baseProficiencyForRole(profile.designationLevel, row.skill),
    source: "recommended",
  }))
}

export function getProfileAudience(jobProfileId: string): number {
  return PROFILE_AUDIENCE[jobProfileId] ?? 12
}

/** Demo scale: ~1k learners across DA job profiles (rollup / catalogue headcount). */
export const DA_COMPETENCY_HEADCOUNT = 1000

const scaledDaHeadcountByProfile = (() => {
  const profiles = getJobProfiles("DA")
  const totalRaw = profiles.reduce((sum, p) => sum + getProfileAudience(p.id), 0)
  const map = new Map<string, number>()
  let assigned = 0
  for (const profile of profiles) {
    const share = getProfileAudience(profile.id) / totalRaw
    const count = Math.max(1, Math.floor(share * DA_COMPETENCY_HEADCOUNT))
    map.set(profile.id, count)
    assigned += count
  }
  const drift = DA_COMPETENCY_HEADCOUNT - assigned
  if (drift !== 0 && profiles[0]) {
    map.set(profiles[0].id, (map.get(profiles[0].id) ?? 1) + drift)
  }
  return map
})()

export function getProfileHeadcount(jobProfileId: string, competencyCode = "DA"): number {
  if (competencyCode === "DA") {
    return scaledDaHeadcountByProfile.get(jobProfileId) ?? 1
  }
  return Math.max(1, getProfileAudience(jobProfileId))
}
