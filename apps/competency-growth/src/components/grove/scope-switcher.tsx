import { cn } from "@/lib/utils"
import type { TaxonomyNode } from "@/domain/types"

export function ScopeSwitcher({
  nodes,
  value,
  onChange,
}: {
  nodes: TaxonomyNode[]
  value: string
  onChange: (id: string) => void
}) {
  const practice = nodes.find((n) => n.kind === "practice")
  const competencies = nodes.filter((n) => n.kind === "competency")
  const options = practice ? [practice, ...competencies] : competencies

  return (
    <div
      className="flex flex-wrap gap-1 rounded-[var(--grove-radius-panel)] border bg-card p-1"
      role="tablist"
      aria-label="Taxonomy scope"
    >
      {options.map((node) => (
        <button
          key={node.id}
          type="button"
          role="tab"
          aria-selected={value === node.id}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === node.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(node.id)}
        >
          {node.label}
        </button>
      ))}
    </div>
  )
}
