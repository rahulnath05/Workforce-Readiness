import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export const SKILL_TAXONOMY_CE: SkillTaxonomyNode[] = [
  {
    id: "ce-cloud",
    label: "Cloud platform",
    kind: "domain",
    children: [
      {
        id: "ce-cloud-core",
        label: "Core services",
        kind: "category",
        children: [
          { id: "ce-skill-cloud-analytics", label: "Cloud analytics", kind: "skill", skillType: "Technical" },
          { id: "ce-skill-terraform", label: "Terraform", kind: "skill", skillType: "Technical" },
          { id: "ce-skill-security", label: "Security fundamentals", kind: "skill", skillType: "Technical" },
        ],
      },
      {
        id: "ce-cloud-data",
        label: "Data on cloud",
        kind: "category",
        children: [
          { id: "ce-skill-sql", label: "SQL", kind: "skill", skillType: "Technical" },
          { id: "ce-skill-modelling", label: "Data modelling", kind: "skill", skillType: "Technical" },
          { id: "ce-skill-observability", label: "Platform observability", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
]
