import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ManagerTeamComposer({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      className="rounded-xl border border-border/80 bg-card p-3 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="manager-ask" className="text-[11px] text-muted-foreground">
        Find a coachee or skill
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="manager-ask"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Aarav, storytelling, SQL…"
            className="pl-8"
            aria-describedby="manager-ask-hint"
          />
        </div>
        <Button type="submit" size="sm" className="shrink-0 bg-forest hover:bg-forest/90">
          Go
        </Button>
      </div>
      <p id="manager-ask-hint" className="mt-1.5 text-[10px] text-muted-foreground">
        Opens a coachee profile or filters the roster by name, focus, or skill.
      </p>
    </form>
  )
}
