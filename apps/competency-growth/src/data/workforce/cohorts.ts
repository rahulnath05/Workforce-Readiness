import type { Cohort, JobProfile, RoleLevel } from "@/domain/types"
import { buildCohortForProfile } from "@/domain/cohort-model"
import { getJobProfile, getJobProfiles } from "@/data/workforce/designation-matrix"

function cohort(profileId: string, leadPersonId: string): Cohort {
  const profile = getJobProfile(profileId)
  if (!profile) throw new Error(`Unknown job profile: ${profileId}`)
  return buildCohortForProfile(profile, leadPersonId)
}

const COHORT_LEAD_OVERRIDES: Record<string, string> = {
  "da-data-analyst": "meera",
  "da-senior-data-analyst": "meera",
  "da-analytics-manager": "sanjay",
  "da-principal-analyst": "sanjay",
  "da-director-da": "sanjay",
  "da-bi-associate": "meera",
  "da-senior-bi-analyst": "meera",
  "da-bi-team-lead": "sanjay",
  "da-solution-architect": "sanjay",
}

function defaultLeadForDesignation(level: RoleLevel): string {
  if (level === "Director" || level === "Sr. Manager") return "sanjay"
  if (level === "Manager") return "arjun"
  return "meera"
}

function leadForProfile(profile: JobProfile): string {
  return COHORT_LEAD_OVERRIDES[profile.id] ?? defaultLeadForDesignation(profile.designationLevel)
}

/** One cohort per job profile (designation + profile); one lead per cohort. */
export const INITIAL_COHORTS: Cohort[] = getJobProfiles("DA").map((profile) =>
  cohort(profile.id, leadForProfile(profile)),
)
