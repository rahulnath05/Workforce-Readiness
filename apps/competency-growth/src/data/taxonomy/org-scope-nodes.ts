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
