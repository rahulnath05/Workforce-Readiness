import { SKILL_TAXONOMY_CE } from "@/data/taxonomy/skill-trees/CE"
import { SKILL_TAXONOMY_DA } from "@/data/taxonomy/skill-trees/DA"
import { SKILL_TAXONOMY_DS } from "@/data/taxonomy/skill-trees/DS"
import { SKILL_TAXONOMY_ET } from "@/data/taxonomy/skill-trees/ET"
import { SKILL_TAXONOMY_PM } from "@/data/taxonomy/skill-trees/PM"
import { SKILL_TAXONOMY_RC } from "@/data/taxonomy/skill-trees/RC"
import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

/** Register every competency skill tree here when adding `skill-trees/<CODE>.ts`. */
export const SKILL_TAXONOMY_BY_COMPETENCY: Record<string, SkillTaxonomyNode[]> = {
  DA: SKILL_TAXONOMY_DA,
  CE: SKILL_TAXONOMY_CE,
  PM: SKILL_TAXONOMY_PM,
  DS: SKILL_TAXONOMY_DS,
  RC: SKILL_TAXONOMY_RC,
  ET: SKILL_TAXONOMY_ET,
}
