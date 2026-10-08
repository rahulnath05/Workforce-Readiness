import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export const SKILL_TAXONOMY_RC: SkillTaxonomyNode[] = [
  {
    id: "rc-risk",
    label: "Risk & compliance",
    kind: "domain",
    children: [
      {
        id: "rc-controls",
        label: "Controls & reporting",
        kind: "category",
        children: [
          { id: "rc-skill-stats", label: "Statistical analysis", kind: "skill", skillType: "Technical" },
          { id: "rc-skill-controls", label: "Controls design", kind: "skill", skillType: "Technical" },
          { id: "rc-skill-reg", label: "Regulatory reporting", kind: "skill", skillType: "Technical" },
          { id: "rc-skill-audit", label: "Audit readiness", kind: "skill", skillType: "Behavioral" },
          { id: "rc-skill-gov", label: "Data governance", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
]
