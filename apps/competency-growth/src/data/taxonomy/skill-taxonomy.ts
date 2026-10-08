import { SKILL_TAXONOMY_BY_COMPETENCY } from "@/data/taxonomy/skill-trees"
import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export function getSkillTaxonomyTree(competencyCode: string): SkillTaxonomyNode[] {
  return SKILL_TAXONOMY_BY_COMPETENCY[competencyCode] ?? []
}

function walkSkills(nodes: SkillTaxonomyNode[], out: string[]) {
  for (const node of nodes) {
    if (node.kind === "skill") {
      out.push(node.label)
    } else if (node.children?.length) {
      walkSkills(node.children, out)
    }
  }
}

/** Flat skill names per competency — used for validation, heatmaps, and legacy pickers. */
export function buildTaxonomySkillIndex(): Record<string, string[]> {
  const index: Record<string, string[]> = {}
  for (const [code, tree] of Object.entries(SKILL_TAXONOMY_BY_COMPETENCY)) {
    const names: string[] = []
    walkSkills(tree, names)
    index[code] = names
  }
  return index
}

export const TAXONOMY_SKILLS = buildTaxonomySkillIndex()

export function listTaxonomySkillLeaves(
  competencyCode: string,
  options?: { exclude?: Set<string> },
): { name: string; skillType: string }[] {
  const exclude = options?.exclude ?? new Set<string>()
  const result: { name: string; skillType: string }[] = []

  function walk(nodes: SkillTaxonomyNode[]) {
    for (const node of nodes) {
      if (node.kind === "skill") {
        if (!exclude.has(node.label)) {
          result.push({ name: node.label, skillType: node.skillType ?? "Technical" })
        }
      } else if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(getSkillTaxonomyTree(competencyCode))
  return result
}

export function filterSkillTaxonomyTree(
  nodes: SkillTaxonomyNode[],
  query: string,
): SkillTaxonomyNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  function filterNode(node: SkillTaxonomyNode): SkillTaxonomyNode | null {
    if (node.kind === "skill") {
      return node.label.toLowerCase().includes(q) ? node : null
    }
    const children = (node.children ?? [])
      .map(filterNode)
      .filter((n): n is SkillTaxonomyNode => n !== null)
    if (!children.length) return null
    return { ...node, children }
  }

  return nodes.map(filterNode).filter((n): n is SkillTaxonomyNode => n !== null)
}
