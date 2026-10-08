import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export const SKILL_TAXONOMY_ET: SkillTaxonomyNode[] = [
  {
    id: "et-emerging",
    label: "Emerging technology",
    kind: "domain",
    children: [
      {
        id: "et-engineering",
        label: "Engineering",
        kind: "category",
        children: [
          { id: "et-skill-python", label: "Python", kind: "skill", skillType: "Technical" },
          { id: "et-skill-stream", label: "Streaming architectures", kind: "skill", skillType: "Technical" },
          { id: "et-skill-mlops", label: "MLOps", kind: "skill", skillType: "Technical" },
          { id: "et-skill-cloud", label: "Cloud analytics", kind: "skill", skillType: "Technical" },
          { id: "et-skill-prompt", label: "Prompt engineering", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
]
