import type { TaxonomyNode } from "@/domain/types"

/** MVP: leader flows are locked to Data and Analytics only. */
export const MVP_SCOPE_NODE_ID = "da"
export const MVP_COMPETENCY_CODE = "DA"

export const TAXONOMY_NODES: TaxonomyNode[] = [
  { id: "consulting", label: "Consulting practice", kind: "practice" },
  { id: "da", label: "Data and Analytics", kind: "competency", parentId: "consulting", competencyCode: "DA" },
  { id: "ms", label: "Microsoft", kind: "competency", parentId: "consulting", competencyCode: "CE" },
  { id: "ap", label: "AppTech", kind: "competency", parentId: "consulting", competencyCode: "PM" },
  { id: "et", label: "Emerging Technology", kind: "competency", parentId: "consulting", competencyCode: "ET" },
]

export const LEADER_OWNED_COMPETENCY_CODES = ["DA", "CE", "RC"] as const

export const TAXONOMY_SKILLS: Record<string, string[]> = {
  DA: ["Python", "SQL", "Data visualization", "Statistical analysis", "Data storytelling"],
  CE: ["Cloud analytics", "Terraform", "SQL", "Data modelling", "Security fundamentals"],
  PM: ["Roadmapping", "Stakeholder management", "Data storytelling", "Discovery practice", "Metrics design"],
  DS: ["Data visualization", "Business case modelling", "Market analysis", "Change management", "Storytelling"],
  RC: ["Statistical analysis", "Controls design", "Regulatory reporting", "Audit readiness", "Data governance"],
  ET: ["Python", "Streaming architectures", "MLOps", "Cloud analytics", "Prompt engineering"],
}
