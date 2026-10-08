import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"

export function countSkillLeaves(node: SkillTaxonomyNode): number {
  if (node.kind === "skill") return 1
  return (node.children ?? []).reduce((sum, child) => sum + countSkillLeaves(child), 0)
}

export function flattenTaxonomyRows(
  nodes: SkillTaxonomyNode[],
  path: string[] = [],
): { path: string; node: SkillTaxonomyNode; depth: number }[] {
  const rows: { path: string; node: SkillTaxonomyNode; depth: number }[] = []
  for (const node of nodes) {
    const nextPath = [...path, node.label]
    rows.push({ path: nextPath.join(" › "), node, depth: path.length })
    if (node.children?.length) {
      rows.push(...flattenTaxonomyRows(node.children, nextPath))
    }
  }
  return rows
}

export function findNodePath(
  nodes: SkillTaxonomyNode[],
  id: string,
  trail: SkillTaxonomyNode[] = [],
): SkillTaxonomyNode[] | null {
  for (const node of nodes) {
    const next = [...trail, node]
    if (node.id === id) return next
    if (node.children?.length) {
      const hit = findNodePath(node.children, id, next)
      if (hit) return hit
    }
  }
  return null
}
