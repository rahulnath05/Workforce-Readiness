import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"
import { countSkillLeaves } from "@/lib/taxonomy-tree-utils"

export function summarizeTaxonomy(competencyName: string, domains: SkillTaxonomyNode[]) {
  const totalSkills = domains.reduce((s, d) => s + countSkillLeaves(d), 0)
  const domainStats = domains.map((d) => ({
    label: d.label,
    count: countSkillLeaves(d),
  }))
  const largest = [...domainStats].sort((a, b) => b.count - a.count)[0]

  let behavioral = 0
  let technical = 0
  function walk(nodes: SkillTaxonomyNode[]) {
    for (const n of nodes) {
      if (n.kind === "skill") {
        if (n.skillType === "Behavioral") behavioral++
        else technical++
      } else if (n.children) walk(n.children)
    }
  }
  walk(domains)

  const summary =
    totalSkills === 0
      ? `There is no published skill tree loaded for ${competencyName} yet.`
      : `${competencyName} is organized into ${domains.length} domains and ${totalSkills} curated skills. ` +
        `${largest ? `The largest cluster is “${largest.label}” (${largest.count} skills). ` : ""}` +
        `${technical} skills map to technical benchmarks; ${behavioral} are behavioral.`

  const recommendation =
    behavioral > 0 && technical > 0
      ? "When publishing benchmarks, balance technical depth with storytelling and stakeholder skills in the delivery domain."
      : "Review domain coverage before publishing new job profiles—gaps in the taxonomy will surface as validation errors."

  return { summary, recommendation, totalSkills, domainStats, behavioral, technical }
}

export function adviseOnNode(path: SkillTaxonomyNode[]): { summary: string; evidence: string; action?: string } {
  const node = path[path.length - 1]
  const trail = path.map((n) => n.label).join(" → ")

  if (node.kind === "skill") {
    return {
      summary: `“${node.label}” is a leaf skill in your curated taxonomy.`,
      evidence: `Path: ${trail}. Benchmark type: ${node.skillType ?? "Technical"}. Skills at this level are validated when you publish or update a job profile.`,
      action: "Use this skill in a benchmark via the publish journey, or check which profiles already target it.",
    }
  }

  const count = countSkillLeaves(node)
  return {
    summary:
      node.kind === "domain"
        ? `The “${node.label}” domain groups ${count} skills across its categories.`
        : `“${node.label}” contains ${count} skills ready for benchmark targeting.`,
    evidence: `Path: ${trail}. Selecting a skill below shows how it links to benchmarks and validation.`,
    action: count > 6 ? "Consider splitting heavy categories when defining role-specific benchmarks." : undefined,
  }
}
