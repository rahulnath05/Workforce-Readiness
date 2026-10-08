import type { PersonRecord } from "@/domain/types"
import { indexToProficiency, proficiencyIndex } from "@/domain/proficiency"
import { cohortIdForJobProfile } from "@/domain/cohort-model"
import { getJobProfiles } from "@/fixtures/designation-matrix"
import { getRecommendedSkills } from "@/fixtures/benchmark-templates"

function skill(skill: string, assessed: number, target: number) {
  return {
    skill,
    assessedProficiency: indexToProficiency(assessed),
    targetProficiency: indexToProficiency(target),
  }
}

function skillsAtReadiness(jobProfileId: string, readinessPct: number) {
  const targets = getRecommendedSkills("DA", jobProfileId)
  const metCount = Math.min(targets.length, Math.max(0, Math.round((readinessPct / 100) * targets.length)))
  return targets.map((t, i) => {
    const targetIdx = proficiencyIndex(t.targetProficiency)
    const assessedIdx = i < metCount ? targetIdx : Math.max(1, targetIdx - 1)
    return {
      skill: t.name,
      assessedProficiency: indexToProficiency(assessedIdx),
      targetProficiency: t.targetProficiency,
    }
  })
}

const PUBLISHED_PROFILES = new Set([
  "da-data-analyst",
  "da-senior-data-analyst",
  "da-analytics-manager",
  "da-solution-architect",
  "da-director-da",
  "da-bi-associate",
  "da-senior-bi-analyst",
  "da-bi-team-lead",
  "da-principal-analyst",
])

const SEED_READINESS_BY_PROFILE: Record<string, number> = {
  "da-data-analyst": 72,
  "da-bi-associate": 68,
  "da-junior-analytics-engineer": 55,
  "da-product-analyst-i": 61,
  "da-marketing-analyst": 58,
  "da-financial-data-analyst": 44,
  "da-senior-bi-analyst": 76,
  "da-analytics-engineer-ii": 82,
  "da-data-architect-junior": 63,
  "da-bi-analyst": 70,
  "da-bi-team-lead": 74,
  "da-solution-architect": 79,
  "da-product-analyst": 66,
  "da-bi-architect": 57,
  "da-sr-analytics-manager": 88,
  "da-sr-solution-architect": 71,
  "da-enterprise-data-architect": 64,
  "da-data-architect": 69,
  "da-vp-bi": 85,
  "da-cdo": 90,
}

const SEED_NAMES = [
  { id: "tara", name: "Tara Singh", initials: "TS" },
  { id: "vikram", name: "Vikram Desai", initials: "VD" },
  { id: "anika", name: "Anika Rao", initials: "AR" },
  { id: "rahul", name: "Rahul Menon", initials: "RM" },
  { id: "priya-s", name: "Priya Sharma", initials: "PS" },
  { id: "omar", name: "Omar Hassan", initials: "OH" },
  { id: "elena", name: "Elena Costa", initials: "EC" },
  { id: "james", name: "James Okafor", initials: "JO" },
  { id: "mei", name: "Mei Lin", initials: "ML" },
  { id: "carlos", name: "Carlos Vega", initials: "CV" },
  { id: "fatima", name: "Fatima Khan", initials: "FK" },
  { id: "liam", name: "Liam Brooks", initials: "LB" },
  { id: "sophie", name: "Sophie Martin", initials: "SM" },
  { id: "dev", name: "Dev Krishnan", initials: "DK" },
  { id: "hana", name: "Hana Ito", initials: "HI" },
]

function seedPersonForProfile(
  profileId: string,
  seed: { id: string; name: string; initials: string },
  readinessPct: number,
  status: PersonRecord["status"],
  urgent?: boolean,
): PersonRecord {
  const profile = getJobProfiles("DA").find((p) => p.id === profileId)!
  return {
    id: seed.id,
    name: seed.name,
    initials: seed.initials,
    role: profile.designationLevel,
    jobProfileId: profileId,
    competencyCode: "DA",
    status,
    progress: readinessPct,
    focus: "Benchmark skills",
    due: urgent ? "5 days" : "16 days",
    urgent,
    tint: "oklch(0.86 0.05 155)",
    cohortId: cohortIdForJobProfile(profileId),
    skills: skillsAtReadiness(profileId, readinessPct),
  }
}

function appendMissingProfileMembers(people: PersonRecord[]): PersonRecord[] {
  const profiles = getJobProfiles("DA")
  const result = [...people]
  let nameIdx = 0
  let syntheticIdx = 0

  for (const profile of profiles) {
    const daMembers = result.filter(
      (p) => p.competencyCode === "DA" && p.jobProfileId === profile.id,
    )
    const targetMembers = PUBLISHED_PROFILES.has(profile.id) ? 2 : 1
    let need = Math.max(0, targetMembers - daMembers.length)

    while (need > 0) {
      const fromPool = nameIdx < SEED_NAMES.length ? SEED_NAMES[nameIdx++] : undefined
      const seed = fromPool ?? {
        id: `seed-${profile.id}-${syntheticIdx++}`,
        name: `Learner ${syntheticIdx}`,
        initials: "L",
      }
      if (result.some((p) => p.id === seed.id)) continue
      const readiness = SEED_READINESS_BY_PROFILE[profile.id] ?? 62
      const atRisk = readiness < 50
      result.push(
        seedPersonForProfile(
          profile.id,
          seed,
          readiness,
          atRisk ? "Behind" : "On track",
          atRisk,
        ),
      )
      need--
    }
  }

  return result
}

const CORE_PEOPLE: PersonRecord[] = [
  {
    id: "aarav",
    name: "Aarav Mehta",
    initials: "AM",
    role: "Sr. Associate",
    jobProfileId: "da-senior-data-analyst",
    competencyCode: "DA",
    status: "On track",
    progress: 62,
    focus: "Python",
    due: "12 days",
    tint: "oklch(0.86 0.06 155)",
    cohortId: "cohort-da-senior-data-analyst",
    skills: [
      skill("Python", 2, 3),
      skill("SQL", 4, 4),
      skill("Data visualization", 3, 3),
      skill("Statistical analysis", 2, 2),
      skill("Data storytelling", 2, 3),
    ],
  },
  {
    id: "nisha",
    name: "Nisha Patel",
    initials: "NP",
    role: "Sr. Associate",
    jobProfileId: "da-senior-data-analyst",
    competencyCode: "DA",
    status: "On track",
    progress: 78,
    focus: "SQL",
    due: "14 days",
    tint: "oklch(0.86 0.05 200)",
    cohortId: "cohort-da-senior-data-analyst",
    skills: [
      skill("Python", 3, 3),
      skill("SQL", 4, 4),
      skill("Data visualization", 3, 3),
      skill("Statistical analysis", 3, 3),
      skill("Data storytelling", 3, 3),
    ],
  },
  {
    id: "meera",
    name: "Meera Iyer",
    initials: "MI",
    role: "Manager",
    jobProfileId: "da-analytics-manager",
    competencyCode: "DA",
    status: "Behind",
    progress: 41,
    focus: "Data storytelling",
    due: "6 days",
    urgent: true,
    tint: "oklch(0.86 0.06 55)",
    cohortId: "cohort-da-analytics-manager",
    skills: [
      skill("Python", 3, 3),
      skill("SQL", 4, 4),
      skill("Data visualization", 3, 3),
      skill("Statistical analysis", 2, 3),
      skill("Data storytelling", 2, 3),
    ],
  },
  {
    id: "arjun",
    name: "Arjun Malhotra",
    initials: "AJ",
    role: "Manager",
    jobProfileId: "da-principal-analyst",
    competencyCode: "DA",
    status: "Behind",
    progress: 47,
    focus: "Data modelling",
    due: "4 days",
    urgent: true,
    tint: "oklch(0.86 0.05 80)",
    cohortId: "cohort-da-principal-analyst",
    skills: [
      skill("Python", 3, 3),
      skill("SQL", 4, 4),
      skill("Data visualization", 3, 3),
      skill("Statistical analysis", 3, 4),
      skill("Data storytelling", 3, 3),
    ],
  },
  {
    id: "rohan",
    name: "Rohan Kulkarni",
    initials: "RK",
    role: "Associate",
    jobProfileId: "da-data-analyst",
    competencyCode: "DA",
    status: "On track",
    progress: 74,
    focus: "SQL",
    due: "18 days",
    tint: "oklch(0.84 0.05 230)",
    cohortId: "cohort-da-data-analyst",
    skills: skillsAtReadiness("da-data-analyst", 74),
  },
  {
    id: "neha",
    name: "Neha Joshi",
    initials: "NJ",
    role: "Sr. Associate",
    jobProfileId: "da-analytics-engineer-ii",
    competencyCode: "DA",
    status: "On track",
    progress: 88,
    focus: "Cloud analytics",
    due: "9 days",
    tint: "oklch(0.86 0.05 155)",
    cohortId: "cohort-da-analytics-engineer-ii",
    skills: skillsAtReadiness("da-analytics-engineer-ii", 88),
  },
  {
    id: "kavya",
    name: "Kavya Nair",
    initials: "KN",
    role: "Sr. Manager",
    jobProfileId: "da-sr-analytics-manager",
    competencyCode: "DA",
    status: "Completed",
    progress: 100,
    focus: "All skills met",
    due: "Closed",
    tint: "oklch(0.86 0.05 300)",
    cohortId: "cohort-da-sr-analytics-manager",
    skills: skillsAtReadiness("da-sr-analytics-manager", 100),
  },
  {
    id: "ishaan",
    name: "Ishaan Verma",
    initials: "IV",
    role: "Manager",
    jobProfileId: "da-product-analyst",
    competencyCode: "DA",
    status: "On track",
    progress: 58,
    focus: "Data visualization",
    due: "21 days",
    tint: "oklch(0.86 0.05 230)",
    cohortId: "cohort-da-product-analyst",
    skills: skillsAtReadiness("da-product-analyst", 58),
  },
  {
    id: "diya",
    name: "Diya Banerjee",
    initials: "DB",
    role: "Associate",
    jobProfileId: "da-financial-data-analyst",
    competencyCode: "DA",
    status: "Failed",
    progress: 33,
    focus: "Statistical analysis",
    due: "Ended",
    tint: "oklch(0.78 0.1 45)",
    cohortId: "cohort-da-financial-data-analyst",
    skills: skillsAtReadiness("da-financial-data-analyst", 33),
  },
  {
    id: "leah",
    name: "Leah Fernandes",
    initials: "LF",
    role: "Associate",
    jobProfileId: "da-junior-analytics-engineer",
    competencyCode: "DA",
    status: "On track",
    progress: 55,
    focus: "Streaming architectures",
    due: "30 days",
    tint: "oklch(0.86 0.05 300)",
    cohortId: "cohort-da-junior-analytics-engineer",
    skills: skillsAtReadiness("da-junior-analytics-engineer", 55),
  },
  {
    id: "sanjay",
    name: "Sanjay Kapoor",
    initials: "SK",
    role: "Director",
    jobProfileId: "da-director-da",
    competencyCode: "DA",
    status: "On track",
    progress: 91,
    focus: "Data governance",
    due: "26 days",
    tint: "oklch(0.86 0.06 55)",
    cohortId: "cohort-da-director-da",
    skills: skillsAtReadiness("da-director-da", 91),
  },
]

export const INITIAL_PEOPLE: PersonRecord[] = appendMissingProfileMembers(CORE_PEOPLE)
