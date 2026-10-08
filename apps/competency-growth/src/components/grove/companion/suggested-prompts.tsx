import { cn } from "cn"

import { Button } from "@/components/ui/button"

export function SuggestedPrompts({
  prompts,
  disabled,
}: {
  prompts: { id: string; label: string; onSelect: () => void }[]
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
      {prompts.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("h-auto whitespace-normal rounded-full px-3 py-1.5 text-left text-xs font-normal")}
          onClick={p.onSelect}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}
