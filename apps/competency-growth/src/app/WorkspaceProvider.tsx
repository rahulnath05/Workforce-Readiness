import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import { toast } from "sonner"

import {
  canLeaderEditCompetency,
  directReports as selectDirectReports,
  filterPeopleInScope,
  getManagerRecordId,
} from "@/domain/selectors"
import type {
  BenchmarkVersion,
  Cohort,
  HeatmapFilter,
  PersonRecord,
  Persona,
  PublishBenchmarkInput,
  ReportCardRecord,
  SkillTarget,
} from "@/domain/types"
import {
  COMPETENCIES,
  createInitialBenchmarkVersions,
  draftSkillsForProfile,
  getJobProfile,
  getProfileAudience,
  INITIAL_COHORTS,
  INITIAL_PEOPLE,
  INITIAL_REPORT_CARDS,
  MVP_COMPETENCY_CODE,
  MVP_SCOPE_NODE_ID,
  PERSONAS,
  TAXONOMY_NODES,
} from "@/data"

export type Preview = "ready" | "empty" | "loading" | "error"

type State = {
  persona: Persona
  scopeNodeId: string
  preview: Preview
  searchQuery: string
  heatmapFilter: HeatmapFilter
  competencies: typeof COMPETENCIES
  benchmarkVersions: BenchmarkVersion[]
  people: PersonRecord[]
  cohorts: Cohort[]
  reportCards: ReportCardRecord[]
}

type Action =
  | { type: "setPersona"; persona: Persona }
  | { type: "setScope"; scopeNodeId: string }
  | { type: "setPreview"; preview: Preview }
  | { type: "setSearch"; query: string }
  | { type: "setHeatmapFilter"; filter: HeatmapFilter }
  | { type: "publishBenchmark"; input: PublishBenchmarkInput }
  | { type: "upsertCohort"; cohort: Cohort }
  | { type: "assignCohortLead"; cohortId: string; leadPersonId: string }
  | { type: "assignPersonCohort"; personId: string; cohortId: string | undefined }
  | { type: "reviewReport"; id: string; status: ReportCardRecord["reviewStatus"]; comment?: string }

function bumpVersion(current: string) {
  const parts = current.split(".")
  const minor = Number(parts[1] ?? 0) + 1
  return `${parts[0]}.${minor}`
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setPersona":
      return { ...state, persona: action.persona }
    case "setScope":
      return { ...state, scopeNodeId: action.scopeNodeId, heatmapFilter: {} }
    case "setPreview":
      return { ...state, preview: action.preview }
    case "setSearch":
      return { ...state, searchQuery: action.query }
    case "setHeatmapFilter":
      return { ...state, heatmapFilter: action.filter }
    case "publishBenchmark": {
      const profile = getJobProfile(action.input.jobProfileId)
      if (!profile) return state
      const existing = state.benchmarkVersions.find(
        (v) =>
          v.competencyCode === action.input.competencyCode &&
          v.jobProfileId === action.input.jobProfileId &&
          v.status === "Published",
      )
      const nextVersion = existing ? bumpVersion(existing.version) : "1.0"
      const superseded = state.benchmarkVersions.map((v) =>
        v.competencyCode === action.input.competencyCode &&
        v.jobProfileId === action.input.jobProfileId &&
        v.status === "Published"
          ? { ...v, status: "Superseded" as const }
          : v,
      )
      const audience = getProfileAudience(action.input.jobProfileId)
      const newVersion: BenchmarkVersion = {
        id: `${action.input.jobProfileId}-${nextVersion}-${Date.now()}`,
        competencyCode: action.input.competencyCode,
        jobProfileId: action.input.jobProfileId,
        role: profile.designationLevel,
        version: nextVersion,
        status: "Published",
        publishedAt: "Today",
        planWindow: action.input.planWindow,
        skills: action.input.skills,
      }
      const competencies = state.competencies.map((c) =>
        c.code === action.input.competencyCode
          ? { ...c, assigned: c.assigned + audience, updated: "Today", status: "Published" as const }
          : c,
      )
      return {
        ...state,
        competencies,
        benchmarkVersions: [...superseded, newVersion],
      }
    }
    case "upsertCohort": {
      const idx = state.cohorts.findIndex((c) => c.id === action.cohort.id)
      const cohorts = idx >= 0 ? state.cohorts.map((c, i) => (i === idx ? action.cohort : c)) : [...state.cohorts, action.cohort]
      return { ...state, cohorts }
    }
    case "assignCohortLead":
      return {
        ...state,
        cohorts: state.cohorts.map((c) =>
          c.id === action.cohortId ? { ...c, leadPersonId: action.leadPersonId } : c,
        ),
      }
    case "assignPersonCohort": {
      const takenBy = state.people.find(
        (p) => p.cohortId === action.cohortId && p.id !== action.personId && action.cohortId,
      )
      if (takenBy && action.cohortId) {
        toast.error("One cohort per person", { description: `${takenBy.name} is already in this cohort. Move them first.` })
        return state
      }
      return {
        ...state,
        people: state.people.map((p) =>
          p.id === action.personId ? { ...p, cohortId: action.cohortId } : p,
        ),
      }
    }
    case "reviewReport":
      return {
        ...state,
        reportCards: state.reportCards.map((card) =>
          card.id === action.id
            ? { ...card, reviewStatus: action.status, leaderComment: action.comment ?? card.leaderComment }
            : card,
        ),
      }
    default:
      return state
  }
}

const initialState: State = {
  persona: "leader",
  scopeNodeId: MVP_SCOPE_NODE_ID,
  preview: "ready",
  searchQuery: "",
  heatmapFilter: {},
  competencies: COMPETENCIES,
  benchmarkVersions: createInitialBenchmarkVersions(),
  people: INITIAL_PEOPLE,
  cohorts: INITIAL_COHORTS,
  reportCards: INITIAL_REPORT_CARDS,
}

type WorkspaceValue = State & {
  taxonomyNodes: typeof TAXONOMY_NODES
  personas: typeof PERSONAS
  scopeCodes: string[]
  isRollUpScope: boolean
  hasDualJourneyAccess: boolean
  canEditInScope: boolean
  scopedPeople: PersonRecord[]
  directReports: PersonRecord[]
  setPersona: (p: Persona) => void
  setScopeNodeId: (id: string) => void
  setPreview: (p: Preview) => void
  setSearchQuery: (q: string) => void
  setHeatmapFilter: (f: HeatmapFilter) => void
  publishBenchmark: (input: PublishBenchmarkInput) => void
  validateCompetency: (competencyCode: string) => boolean
  upsertCohort: (cohort: Cohort, options?: { silent?: boolean }) => void
  assignCohortLead: (cohortId: string, leadPersonId: string) => void
  assignPersonCohort: (personId: string, cohortId?: string) => void
  reviewReportCard: (id: string, status: ReportCardRecord["reviewStatus"], comment?: string) => void
  draftSkillsForProfile: (competencyCode: string, jobProfileId: string) => SkillTarget[]
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const scopeCodes = useMemo(() => [MVP_COMPETENCY_CODE], [])

  const isRollUpScope = false
  const hasDualJourneyAccess = true

  const canEditInScope = useMemo(
    () => canLeaderEditCompetency(MVP_COMPETENCY_CODE, MVP_SCOPE_NODE_ID, TAXONOMY_NODES),
    [],
  )

  const visibleCompetencies = useMemo(
    () => state.competencies.filter((c) => c.code === MVP_COMPETENCY_CODE),
    [state.competencies],
  )

  const visibleCohorts = useMemo(
    () => state.cohorts.filter((c) => c.competencyCode === MVP_COMPETENCY_CODE),
    [state.cohorts],
  )

  const scopedPeople = useMemo(
    () => filterPeopleInScope(state.people, scopeCodes, state.heatmapFilter),
    [state.people, scopeCodes, state.heatmapFilter],
  )

  const directReports = useMemo(() => {
    const managerId = getManagerRecordId(state.persona, PERSONAS)
    if (!managerId) return []
    return selectDirectReports(state.people, managerId)
  }, [state.persona, state.people])

  const publishBenchmark = useCallback(
    (input: PublishBenchmarkInput) => {
      if (!canLeaderEditCompetency(input.competencyCode, state.scopeNodeId, TAXONOMY_NODES)) {
        toast.error("Read-only scope", { description: "Switch to an owned competency to publish benchmarks." })
        return
      }
      const profile = getJobProfile(input.jobProfileId)
      dispatch({ type: "publishBenchmark", input })
      toast.success("Published", {
        description: `${profile?.label ?? input.jobProfileId} benchmark is live for this job profile.`,
      })
    },
    [state.scopeNodeId],
  )

  const validateCompetency = useCallback(
    (competencyCode: string) => {
      if (state.persona === "ld") {
        toast.success("Org-wide validation", { description: `${competencyCode}: all skills resolve against the curated taxonomy.` })
        return true
      }
      if (isRollUpScope) {
        toast.error("Practice roll-up", { description: "Validation runs on owned competencies only." })
        return false
      }
      if (!canLeaderEditCompetency(competencyCode, state.scopeNodeId, TAXONOMY_NODES)) {
        toast.error("Not in your scope", { description: "You can validate competencies you own." })
        return false
      }
      toast.success("Taxonomy validated", { description: `${competencyCode}: all skills resolve against the curated taxonomy.` })
      return true
    },
    [isRollUpScope, state.scopeNodeId, state.persona],
  )

  const value: WorkspaceValue = {
    ...state,
    competencies: visibleCompetencies,
    cohorts: visibleCohorts,
    scopeNodeId: MVP_SCOPE_NODE_ID,
    taxonomyNodes: TAXONOMY_NODES.filter((n) => n.id === MVP_SCOPE_NODE_ID),
    personas: PERSONAS,
    scopeCodes,
    isRollUpScope,
    hasDualJourneyAccess,
    canEditInScope,
    scopedPeople,
    directReports,
    setPersona: (persona) => dispatch({ type: "setPersona", persona }),
    setScopeNodeId: (scopeNodeId) => {
      if (scopeNodeId === MVP_SCOPE_NODE_ID) {
        dispatch({ type: "setScope", scopeNodeId })
      }
    },
    setPreview: (preview) => dispatch({ type: "setPreview", preview }),
    setSearchQuery: (query) => dispatch({ type: "setSearch", query }),
    setHeatmapFilter: (filter) => dispatch({ type: "setHeatmapFilter", filter }),
    publishBenchmark,
    validateCompetency,
    upsertCohort: (cohort, options) => {
      dispatch({ type: "upsertCohort", cohort })
      if (!options?.silent) {
        toast.success("Cohort saved", { description: cohort.name })
      }
    },
    assignCohortLead: (cohortId, leadPersonId) => {
      dispatch({ type: "assignCohortLead", cohortId, leadPersonId })
      toast.success("Cohort lead assigned")
    },
    assignPersonCohort: (personId, cohortId) => dispatch({ type: "assignPersonCohort", personId, cohortId }),
    reviewReportCard: (id, status, comment) => {
      dispatch({ type: "reviewReport", id, status, comment })
      toast.success("Report card updated", { description: status })
    },
    draftSkillsForProfile,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
