import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export const SKILL_TAXONOMY_DS: SkillTaxonomyNode[] = [
  {
    id: "ds-strategy",
    label: "Digital strategy",
    kind: "domain",
    children: [
      {
        id: "ds-insight",
        label: "Insight & change",
        kind: "category",
        children: [
          { id: "ds-skill-viz", label: "Data visualization", kind: "skill", skillType: "Technical" },
          { id: "ds-skill-biz-case", label: "Business case modelling", kind: "skill", skillType: "Behavioral" },
          { id: "ds-skill-market", label: "Market analysis", kind: "skill", skillType: "Technical" },
          { id: "ds-skill-change", label: "Change management", kind: "skill", skillType: "Behavioral" },
          { id: "ds-skill-story", label: "Storytelling", kind: "skill", skillType: "Behavioral" },
        ],
      },
    ],
  },
]
