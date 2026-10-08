import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

/** Data Analytics skill library — domains → categories → skills. */
export const SKILL_TAXONOMY_DA: SkillTaxonomyNode[] = [
  {
    id: "da-data-access",
    label: "Data access & engineering",
    kind: "domain",
    children: [
      {
        id: "da-data-access-query",
        label: "Query & transformation",
        kind: "category",
        children: [
          { id: "da-skill-sql", label: "SQL", kind: "skill", skillType: "Technical" },
          { id: "da-skill-python", label: "Python", kind: "skill", skillType: "Technical" },
          { id: "da-skill-dbt", label: "dbt modelling", kind: "skill", skillType: "Technical" },
          { id: "da-skill-spark", label: "Apache Spark", kind: "skill", skillType: "Technical" },
          { id: "da-skill-etl", label: "ETL pipeline design", kind: "skill", skillType: "Technical" },
        ],
      },
      {
        id: "da-data-access-platform",
        label: "Platform & storage",
        kind: "category",
        children: [
          { id: "da-skill-warehouse", label: "Cloud data warehouse", kind: "skill", skillType: "Technical" },
          { id: "da-skill-lakehouse", label: "Lakehouse patterns", kind: "skill", skillType: "Technical" },
          { id: "da-skill-governance-tech", label: "Data governance (technical)", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
  {
    id: "da-analytics",
    label: "Analytics & insight",
    kind: "domain",
    children: [
      {
        id: "da-analytics-core",
        label: "Core analytics",
        kind: "category",
        children: [
          { id: "da-skill-stats", label: "Statistical analysis", kind: "skill", skillType: "Technical" },
          { id: "da-skill-exp-design", label: "Experiment design", kind: "skill", skillType: "Technical" },
          { id: "da-skill-forecast", label: "Forecasting", kind: "skill", skillType: "Technical" },
          { id: "da-skill-segment", label: "Segmentation analysis", kind: "skill", skillType: "Technical" },
          { id: "da-skill-kpi", label: "KPI design", kind: "skill", skillType: "Technical" },
        ],
      },
      {
        id: "da-analytics-advanced",
        label: "Advanced methods",
        kind: "category",
        children: [
          { id: "da-skill-ml-fund", label: "Machine learning fundamentals", kind: "skill", skillType: "Technical" },
          { id: "da-skill-causal", label: "Causal inference", kind: "skill", skillType: "Technical" },
          { id: "da-skill-optim", label: "Optimisation modelling", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
  {
    id: "da-visualization",
    label: "Visualization & storytelling",
    kind: "domain",
    children: [
      {
        id: "da-viz-tools",
        label: "Visualization tools",
        kind: "category",
        children: [
          { id: "da-skill-dataviz", label: "Data visualization", kind: "skill", skillType: "Technical" },
          { id: "da-skill-powerbi", label: "Power BI", kind: "skill", skillType: "Technical" },
          { id: "da-skill-tableau", label: "Tableau", kind: "skill", skillType: "Technical" },
        ],
      },
      {
        id: "da-viz-narrative",
        label: "Narrative & influence",
        kind: "category",
        children: [
          { id: "da-skill-story", label: "Data storytelling", kind: "skill", skillType: "Behavioral" },
          { id: "da-skill-exec-pres", label: "Executive presentations", kind: "skill", skillType: "Behavioral" },
          { id: "da-skill-dashboard-ux", label: "Dashboard UX", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
  {
    id: "da-delivery",
    label: "Delivery & collaboration",
    kind: "domain",
    children: [
      {
        id: "da-delivery-practice",
        label: "Consulting practice",
        kind: "category",
        children: [
          { id: "da-skill-req", label: "Requirements discovery", kind: "skill", skillType: "Behavioral" },
          { id: "da-skill-stakeholder", label: "Stakeholder management", kind: "skill", skillType: "Behavioral" },
          { id: "da-skill-agile-analytics", label: "Agile analytics delivery", kind: "skill", skillType: "Behavioral" },
          { id: "da-skill-quality", label: "Analytical quality assurance", kind: "skill", skillType: "Technical" },
        ],
      },
    ],
  },
]
