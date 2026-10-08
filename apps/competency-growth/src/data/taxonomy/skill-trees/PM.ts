import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export const SKILL_TAXONOMY_PM: SkillTaxonomyNode[] = [
  {
    id: "pm-product",
    label: "Product practice",
    kind: "domain",
    children: [
      {
        id: "pm-strategy",
        label: "Strategy & discovery",
        kind: "category",
        children: [
          { id: "pm-skill-roadmap", label: "Roadmapping", kind: "skill", skillType: "Behavioral" },
          { id: "pm-skill-discovery", label: "Discovery practice", kind: "skill", skillType: "Behavioral" },
          { id: "pm-skill-metrics", label: "Metrics design", kind: "skill", skillType: "Technical" },
        ],
      },
      {
        id: "pm-collab",
        label: "Collaboration",
        kind: "category",
        children: [
          { id: "pm-skill-stakeholder", label: "Stakeholder management", kind: "skill", skillType: "Behavioral" },
          { id: "pm-skill-story", label: "Data storytelling", kind: "skill", skillType: "Behavioral" },
        ],
      },
    ],
  },
]
