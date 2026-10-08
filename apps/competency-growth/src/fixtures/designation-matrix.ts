import type { DesignationLevelMeta, JobProfile, RoleLevel } from "@/domain/types"

export const DA_DESIGNATION_LEVELS: DesignationLevelMeta[] = [
  {
    level: "Associate",
    yoeRange: "0 – 3 years",
    autonomy: "Task-focused; executes clearly defined assignments under regular guidance.",
    coreScope: [
      "Raw data extraction, cleaning, and preparation (wrangling)",
      "Functional SQL (joins, aggregations) and basic Python scripts",
      "Maintain and refresh operational dashboards and spreadsheets",
      "Document data definitions and field mappings",
    ],
  },
  {
    level: "Sr. Associate",
    yoeRange: "3 – 6 years",
    autonomy: "Project-focused; owns complete workflows and localized stakeholder relationships.",
    coreScope: [
      "Design and deploy end-to-end dashboards (Power BI, Tableau)",
      "Production-grade downstream models (e.g. dbt)",
      "Exploratory analysis and localized A/B testing",
      "Local schema design and query performance optimization",
    ],
  },
  {
    level: "Manager",
    yoeRange: "6 – 9 years",
    autonomy: "Squad-focused; leads a small team or acts as a high-impact technical lead.",
    coreScope: [
      "Translate ambiguous business problems into analytics roadmaps",
      "Standardize core metrics and semantic definitions",
      "Diagnostic analytics and statistical forecasting pipelines",
      "Mentor associates; code review and quality assurance",
    ],
  },
  {
    level: "Sr. Manager",
    yoeRange: "9 – 13 years",
    autonomy: "Function-focused; owns the data roadmap for a department or major product line.",
    coreScope: [
      "Evaluate and design core cloud data stacks",
      "Capacity planning; align analytics with corporate OKRs",
      "Performance tuning, security architecture, FinOps",
      "Bridge engineering and business across workstreams",
    ],
  },
  {
    level: "Director",
    yoeRange: "13+ years",
    autonomy: "Enterprise-focused; global strategy and organizational data vision.",
    coreScope: [
      "Global data governance, MDM, and compliance frameworks",
      "Data org budget, licensing, and vendor negotiations",
      "Integrate data capabilities into long-term growth strategy",
      "Sponsor major transformations and emerging tech adoption",
    ],
  },
]

export const DA_JOB_PROFILES: JobProfile[] = [
  { id: "da-data-analyst", competencyCode: "DA", label: "Data Analyst", designationLevel: "Associate", family: "Analyst" },
  { id: "da-bi-associate", competencyCode: "DA", label: "BI Associate", designationLevel: "Associate", family: "Analyst" },
  { id: "da-junior-analytics-engineer", competencyCode: "DA", label: "Junior Analytics Engineer", designationLevel: "Associate", family: "Engineering" },
  { id: "da-product-analyst-i", competencyCode: "DA", label: "Product Analyst I", designationLevel: "Associate", family: "Analyst" },
  { id: "da-marketing-analyst", competencyCode: "DA", label: "Marketing Analyst", designationLevel: "Associate", family: "Analyst" },
  { id: "da-financial-data-analyst", competencyCode: "DA", label: "Financial Data Analyst", designationLevel: "Associate", family: "Analyst" },
  { id: "da-senior-data-analyst", competencyCode: "DA", label: "Senior Data Analyst", designationLevel: "Sr. Associate", family: "Analyst" },
  { id: "da-senior-bi-analyst", competencyCode: "DA", label: "Senior BI Analyst", designationLevel: "Sr. Associate", family: "Analyst" },
  { id: "da-analytics-engineer-ii", competencyCode: "DA", label: "Analytics Engineer II", designationLevel: "Sr. Associate", family: "Engineering" },
  { id: "da-data-architect-junior", competencyCode: "DA", label: "Data Architect (Junior)", designationLevel: "Sr. Associate", family: "Architect" },
  { id: "da-bi-analyst", competencyCode: "DA", label: "Business Intelligence (BI) Analyst", designationLevel: "Sr. Associate", family: "Analyst" },
  { id: "da-analytics-manager", competencyCode: "DA", label: "Analytics Manager", designationLevel: "Manager", family: "Leadership" },
  { id: "da-bi-team-lead", competencyCode: "DA", label: "BI Team Lead", designationLevel: "Manager", family: "Leadership" },
  { id: "da-solution-architect", competencyCode: "DA", label: "Solution Architect", designationLevel: "Manager", family: "Architect" },
  { id: "da-principal-analyst", competencyCode: "DA", label: "Principal Analyst", designationLevel: "Manager", family: "Analyst" },
  { id: "da-product-analyst", competencyCode: "DA", label: "Product Analyst", designationLevel: "Manager", family: "Analyst" },
  { id: "da-bi-architect", competencyCode: "DA", label: "BI Architect", designationLevel: "Manager", family: "Architect" },
  { id: "da-sr-analytics-manager", competencyCode: "DA", label: "Senior Analytics Manager", designationLevel: "Sr. Manager", family: "Leadership" },
  { id: "da-sr-solution-architect", competencyCode: "DA", label: "Senior Solution Architect", designationLevel: "Sr. Manager", family: "Architect" },
  { id: "da-enterprise-data-architect", competencyCode: "DA", label: "Enterprise Data Architect", designationLevel: "Sr. Manager", family: "Architect" },
  { id: "da-data-architect", competencyCode: "DA", label: "Data Architect", designationLevel: "Sr. Manager", family: "Architect" },
  { id: "da-director-da", competencyCode: "DA", label: "Director of Data & Analytics", designationLevel: "Director", family: "Leadership" },
  { id: "da-vp-bi", competencyCode: "DA", label: "VP of Business Intelligence", designationLevel: "Director", family: "Leadership" },
  { id: "da-cdo", competencyCode: "DA", label: "Chief Data Officer (CDO)", designationLevel: "Director", family: "Leadership" },
]

export function getDesignationMeta(level: RoleLevel): DesignationLevelMeta | undefined {
  return DA_DESIGNATION_LEVELS.find((d) => d.level === level)
}

export function getJobProfiles(competencyCode: string, designationLevel?: RoleLevel): JobProfile[] {
  let list = DA_JOB_PROFILES.filter((p) => p.competencyCode === competencyCode)
  if (designationLevel) list = list.filter((p) => p.designationLevel === designationLevel)
  return list
}

export function getJobProfile(profileId: string): JobProfile | undefined {
  return DA_JOB_PROFILES.find((p) => p.id === profileId)
}

export function totalProfilesForCompetency(competencyCode: string): number {
  return getJobProfiles(competencyCode).length
}
