import { cn } from "cn"

import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"
import { countSkillLeaves } from "@/lib/taxonomy-tree-utils"

export function TaxonomyEcosystemMap({
  domains,
  selectedId,
  onSelect,
  zoom,
}: {
  domains: SkillTaxonomyNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  zoom: "fit" | "focus"
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch justify-center gap-4 p-2 transition-[gap] duration-300",
        zoom === "focus" && "gap-6",
      )}
      role="list"
      aria-label="Competency skill domains"
    >
      {domains.map((domain, index) => (
        <DomainCluster
          key={domain.id}
          domain={domain}
          selectedId={selectedId}
          onSelect={onSelect}
          scale={clusterScale(domain, index)}
        />
      ))}
    </div>
  )
}

function clusterScale(domain: SkillTaxonomyNode, index: number): "lg" | "md" | "sm" {
  const n = countSkillLeaves(domain)
  if (n >= 14) return "lg"
  if (n >= 8) return "md"
  return index % 2 === 0 ? "md" : "sm"
}

function DomainCluster({
  domain,
  selectedId,
  onSelect,
  scale,
}: {
  domain: SkillTaxonomyNode
  selectedId: string | null
  onSelect: (id: string) => void
  scale: "lg" | "md" | "sm"
}) {
  const skillCount = countSkillLeaves(domain)
  const domainSelected = selectedId === domain.id

  return (
    <article
      className={cn(
        "relative flex min-w-[min(100%,18rem)] flex-col rounded-[1.75rem] border-2 border-dashed p-4 transition-shadow",
        scale === "lg" && "flex-[1_1_22rem] min-h-[16rem]",
        scale === "md" && "flex-[1_1_18rem] min-h-[13rem]",
        scale === "sm" && "flex-[1_1_15rem] min-h-[11rem]",
        domainSelected
          ? "border-forest/50 bg-[var(--grove-positive-soft)]/30 shadow-md"
          : "border-border/60 bg-card/80 shadow-sm hover:shadow-md",
      )}
      role="listitem"
    >
      <button
        type="button"
        onClick={() => onSelect(domain.id)}
        className="mb-3 w-full rounded-2xl text-left focus-visible:ring-2 focus-visible:ring-ring"
        aria-pressed={domainSelected}
      >
        <p className="font-heading text-sm font-semibold leading-snug">{domain.label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{skillCount} skills · domain</p>
      </button>
      <div className="flex min-h-0 flex-1 flex-wrap content-start gap-3">
        {(domain.children ?? []).map((category) => (
          <CategoryCluster
            key={category.id}
            category={category}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </article>
  )
}

function CategoryCluster({
  category,
  selectedId,
  onSelect,
}: {
  category: SkillTaxonomyNode
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const selected = selectedId === category.id
  const skills = category.children ?? []

  return (
    <div
      className={cn(
        "min-w-[8.5rem] max-w-full flex-1 rounded-[1.25rem] border p-2.5",
        selected ? "border-forest/40 bg-background shadow-sm" : "border-border/50 bg-muted/30",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(category.id)}
        className="mb-2 w-full text-left text-xs font-semibold leading-snug focus-visible:ring-2 focus-visible:ring-ring"
        aria-pressed={selected}
      >
        {category.label}
      </button>
      <ul className="flex flex-wrap gap-1.5" role="list">
        {skills.map((skill) => {
          const skillOn = selectedId === skill.id
          return (
            <li key={skill.id} role="listitem">
              <button
                type="button"
                onClick={() => onSelect(skill.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  skillOn
                    ? "bg-forest text-white"
                    : "bg-card ring-1 ring-border/70 hover:bg-[var(--grove-positive-soft)]/50",
                )}
                aria-pressed={skillOn}
              >
                {skill.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
