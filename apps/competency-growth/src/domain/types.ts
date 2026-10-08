export type Persona = "leader" | "candidate" | "manager" | "ld"

export type RoleLevel =
  | "Associate"
  | "Sr. Associate"
  | "Manager"
  | "Sr. Manager"
  | "Director"

export const ROLE_LEVELS: RoleLevel[] = [
  "Associate",
  "Sr. Associate",
  "Manager",
  "Sr. Manager",
  "Director",
]

export type CompetencyStatus = "Published" | "Draft" | "Review"

export type BenchmarkStatus = "Published" | "Draft" | "Superseded"

export type PersonStatus = "On track" | "Behind" | "Completed" | "Failed"

export type ReportVerdict = "Success" | "Partial" | "Fail"

export type ReviewStatus = "awaiting" | "approved" | "commented" | "escalated"

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"

export interface DesignationLevelMeta {
  level: RoleLevel
  yoeRange: string
  autonomy: string
  coreScope: string[]
}

export interface JobProfile {
  id: string
  competencyCode: string
  label: string
  designationLevel: RoleLevel
  family?: string
}

export interface TaxonomyNode {
  id: string
  label: string
  parentId?: string
  kind: "practice" | "competency"
  competencyCode?: string
}

export interface CompetencyRecord {
  code: string
  name: string
  taxonomyId: string
  skills: number
  roles: number
  status: CompetencyStatus
  assigned: number
  owner: string
  updated: string
  inDraft: number
}

export interface SkillTarget {
  name: string
  type: string
  targetProficiency: ProficiencyLevel
  source?: "taxonomy" | "custom" | "recommended"
}

export interface BenchmarkVersion {
  id: string
  competencyCode: string
  jobProfileId: string
  role: RoleLevel
  version: string
  status: BenchmarkStatus
  skills: SkillTarget[]
  publishedAt?: string
  planWindow?: string
}

export interface PublishBenchmarkInput {
  competencyCode: string
  jobProfileId: string
  skills: SkillTarget[]
  planWindow: string
  waivedCheckIds?: string[]
}

export interface Cohort {
  id: string
  name: string
  competencyCode: string
  jobProfileId: string
  designationLevel: RoleLevel
  leadPersonId: string
}

export interface PersonSkill {
  skill: string
  assessedProficiency: ProficiencyLevel
  targetProficiency: ProficiencyLevel
}

export interface PersonRecord {
  id: string
  name: string
  initials: string
  role: RoleLevel | string
  jobProfileId: string
  competencyCode: string
  status: PersonStatus
  progress: number
  focus: string
  due: string
  urgent?: boolean
  tint: string
  cohortId?: string
  managerId?: string
  skills: PersonSkill[]
}

export interface ReportCardRecord {
  id: string
  personId: string
  competency: string
  verdict: ReportVerdict
  summary: string
  date: string
  reviewStatus: ReviewStatus
  leaderComment?: string
}

export interface AppNotification {
  id: string
  persona: Persona
  title: string
  body: string
  time: string
  unread: boolean
}

export type JourneyStepState = "done" | "current" | "later"

export interface JourneyStep {
  label: string
  hint: string
  state: JourneyStepState
}

export interface PersonaMeta {
  id: Persona
  label: string
  name: string
  role: string
  initials: string
  tint: string
  /** Workforce anchor for people who report to this persona (e.g. People Manager). */
  recordId?: string
}

export interface HeatmapFilter {
  skill?: string
  role?: RoleLevel
  jobProfileId?: string
}

export interface ValidationCheck {
  id: string
  level: "pass" | "warn" | "error"
  title: string
  detail: string
  waivable?: boolean
}
