import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"
import { countSkillLeaves } from "@/lib/taxonomy-tree-utils"

const KIND_LABEL: Record<SkillTaxonomyNode["kind"], string> = {
  domain: "Domain cluster",
  category: "Category cluster",
  skill: "Skill",
}

export function TaxonomyRelationshipInspector({
  path,
  node,
  onClose,
}: {
  path: SkillTaxonomyNode[]
  node: SkillTaxonomyNode
  onClose: () => void
}) {
  const skillCount = countSkillLeaves(node)
  const breadcrumb = path.map((n) => n.label).join(" → ")

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Relationship inspector</p>
          <h2 className="mt-1 font-heading text-base font-semibold leading-snug">{node.label}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">{KIND_LABEL[node.kind]}</p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close inspector" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-[11px] text-muted-foreground">Path in ecosystem</dt>
          <dd className="mt-0.5 leading-snug">{breadcrumb}</dd>
        </div>
        {node.kind === "skill" && node.skillType && (
          <div>
            <dt className="text-[11px] text-muted-foreground">Benchmark skill type</dt>
            <dd className="mt-0.5 font-medium">{node.skillType}</dd>
          </div>
        )}
        {node.kind !== "skill" && (
          <div>
            <dt className="text-[11px] text-muted-foreground">Skills in cluster</dt>
            <dd className="mt-0.5 font-medium tabular-nums">{skillCount}</dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] text-muted-foreground">Governance</dt>
          <dd className="mt-0.5 text-muted-foreground">
            Curated taxonomy leaf — used in benchmark validation and skill pickers.
          </dd>
        </div>
        {node.children && node.children.length > 0 && (
          <div>
            <dt className="text-[11px] text-muted-foreground">Connected to</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {node.children.map((child) => (
                <span
                  key={child.id}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground"
                >
                  {child.label}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
