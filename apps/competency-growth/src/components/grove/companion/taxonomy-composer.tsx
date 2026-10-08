import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TaxonomyComposer({
  value,
  onChange,
  onSubmit,
  competencyLabel,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  competencyLabel: string
}) {
  return (
    <form
      className="rounded-xl border border-border/80 bg-card p-3 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="taxonomy-ask" className="text-[11px] text-muted-foreground">
        Ask about skills in <span className="font-medium text-foreground">{competencyLabel}</span>
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="taxonomy-ask"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. SQL, storytelling, platform skills…"
            className="pl-8"
            aria-describedby="taxonomy-ask-hint"
          />
        </div>
        <Button type="submit" size="sm" className="shrink-0 bg-forest hover:bg-forest/90">Apply filter</Button>
      </div>
      <p id="taxonomy-ask-hint" className="mt-1.5 text-[10px] text-muted-foreground">
        Filters the evidence map and table—scope stays on this competency.
      </p>
    </form>
  )
}
