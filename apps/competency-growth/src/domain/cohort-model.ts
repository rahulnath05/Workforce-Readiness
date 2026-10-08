import type { Cohort, JobProfile, PersonRecord, PersonStatus } from "@/domain/types"

export function cohortIdForJobProfile(jobProfileId: string): string {
  return `cohort-${jobProfileId}`
}

export function buildCohortForProfile(profile: JobProfile, leadPersonId: string): Cohort {
  return {
    id: cohortIdForJobProfile(profile.id),
    name: `${profile.designationLevel} · ${profile.label}`,
    competencyCode: profile.competencyCode,
    jobProfileId: profile.id,
    designationLevel: profile.designationLevel,
    leadPersonId,
  }
}

export function findCohortByJobProfile(cohorts: Cohort[], jobProfileId: string): Cohort | undefined {
  return cohorts.find((c) => c.jobProfileId === jobProfileId)
}

/** Learners assigned to this profile cohort (job profile + competency). */
export function cohortRosterMembers(people: PersonRecord[], cohort: Cohort): PersonRecord[] {
  return people.filter(
    (p) => p.competencyCode === cohort.competencyCode && p.jobProfileId === cohort.jobProfileId,
  )
}

export interface CohortRosterLine {
  id: string
  name: string
  role: string
  status: PersonStatus
  progress: number
  due: string
}

const ROSTER_FIRST_NAMES = [
  "Aarav",
  "Meera",
  "Arjun",
  "Nisha",
  "Rohan",
  "Neha",
  "Kavya",
  "Ishaan",
  "Diya",
  "Leah",
  "Sanjay",
  "Tara",
  "Vikram",
  "Anika",
  "Rahul",
  "Priya",
  "Omar",
  "Elena",
  "James",
  "Mei",
]

const ROSTER_LAST_NAMES = [
  "Mehta",
  "Iyer",
  "Malhotra",
  "Patel",
  "Kulkarni",
  "Joshi",
  "Nair",
  "Verma",
  "Banerjee",
  "Fernandes",
  "Kapoor",
  "Singh",
  "Desai",
  "Rao",
  "Menon",
  "Sharma",
  "Hassan",
  "Costa",
  "Okafor",
  "Lin",
]

function syntheticLearnerName(index: number): string {
  const first = ROSTER_FIRST_NAMES[index % ROSTER_FIRST_NAMES.length]
  const last = ROSTER_LAST_NAMES[Math.floor(index / ROSTER_FIRST_NAMES.length) % ROSTER_LAST_NAMES.length]
  return `${first} ${last}`
}

function isAtRiskStatus(status: PersonStatus): boolean {
  return status === "Behind" || status === "Failed"
}

/** Roster lines for cohort pack UI — padded to catalogue headcount with deterministic demo learners. */
export function buildCohortRosterDisplay(
  people: PersonRecord[],
  cohort: Cohort,
  headcount: number,
  options?: { atRiskCount?: number; avgProgress?: number },
): CohortRosterLine[] {
  const members = cohortRosterMembers(people, cohort)
  const target = Math.max(1, headcount)
  const atRiskTarget = Math.min(target, options?.atRiskCount ?? 0)
  const avgProgress = options?.avgProgress ?? 68

  const lines: CohortRosterLine[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: String(m.role),
    status: m.status,
    progress: m.progress,
    due: m.due,
  }))

  let atRiskAssigned = lines.filter((l) => isAtRiskStatus(l.status)).length

  for (let i = lines.length; i < target; i++) {
    const progress = Math.min(100, Math.max(18, avgProgress + ((i * 11) % 31) - 15))
    const markAtRisk = atRiskAssigned < atRiskTarget && (progress < 52 || i % 17 === 0)
    if (markAtRisk) atRiskAssigned++
    lines.push({
      id: `synthetic-${cohort.id}-${i}`,
      name: syntheticLearnerName(i),
      role: cohort.designationLevel,
      status: markAtRisk ? "Behind" : "On track",
      progress,
      due: `${(i % 27) + 4} days`,
    })
  }

  return lines.slice(0, target)
}
