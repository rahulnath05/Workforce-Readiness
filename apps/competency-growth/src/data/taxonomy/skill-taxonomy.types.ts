export type SkillTaxonomyNodeKind = "domain" | "category" | "skill"

export interface SkillTaxonomyNode {
  id: string
  label: string
  kind: SkillTaxonomyNodeKind
  /** Set on `kind: "skill"` leaves — maps to benchmark skill type. */
  skillType?: string
  children?: SkillTaxonomyNode[]
}
