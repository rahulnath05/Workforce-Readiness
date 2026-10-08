import { cn } from "cn"

import type { PersonRecord } from "@/domain/types"

const TARGET = 80

export function TeamProgressChart({
  people,
  onSelect,
  selectedId,
}: {
  people: PersonRecord[]
  onSelect?: (id: string) => void
  selectedId?: string | null
}) {
  const sorted = [...people].sort((a, b) => a.progress - b.progress)

  return (
    <figure className="overflow-hidden rounded-[var(--grove-radius-panel)] border border-border/80 bg-card ring-1 ring-foreground/[0.04]">
      <figcaption className="border-b border-border/60 px-4 py-3">
        <p className="font-heading text-base font-semibold tracking-tight">Progress by coachee</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Sorted lowest to highest · Dashed line = {TARGET}% cycle target
        </p>
      </figcaption>
      <div className="px-4 py-5">
        <ul className="space-y-3" role="list">
          {sorted.map((person) => {
            const below = person.progress < TARGET
            const active = selectedId === person.id
            return (
              <li key={person.id}>
                <button
                  type="button"
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-1 py-1 text-left transition-colors",
                    onSelect && "hover:bg-muted/40",
                    active && "bg-muted/50 ring-1 ring-border/80",
                  )}
                  disabled={!onSelect}
                  onClick={() => onSelect?.(person.id)}
                >
                  <span className="w-[7.5rem] shrink-0 truncate text-xs font-medium text-foreground">
                    {person.name}
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block h-7 overflow-hidden rounded-sm bg-muted/50">
                      <span
                        className={cn(
                          "block h-full rounded-sm transition-all",
                          below ? "bg-heat-3" : "bg-forest",
                        )}
                        style={{ width: `${Math.min(100, person.progress)}%` }}
                      />
                    </span>
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                    {person.progress}%
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No coachees match the current filter.</p>
        )}
      </div>
      <p className="border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground">
        Source: published benchmark cycles · Data Analytics · updated May 22
      </p>
    </figure>
  )
}
