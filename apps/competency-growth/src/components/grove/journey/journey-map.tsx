import { CheckIcon } from "lucide-react"
import { cn } from "cn"

export type JourneyMapStep = {
  id: number
  label: string
  description?: string
}

export function JourneyMap({
  steps,
  currentStep,
  completedThrough,
  blockedStep,
}: {
  steps: JourneyMapStep[]
  currentStep: number
  completedThrough: number
  blockedStep?: number
}) {
  return (
    <ol className="space-y-1" aria-label="Benchmark journey progress">
      {steps.map((step) => {
        const done = step.id <= completedThrough && step.id < currentStep
        const active = step.id === currentStep
        const future = step.id > currentStep
        const blocked = blockedStep === step.id
        return (
          <li
            key={step.id}
            className={cn(
              "flex gap-3 rounded-lg px-3 py-2.5 transition-colors",
              active && "bg-[var(--grove-positive-soft)]/50",
              future && !blocked && "opacity-70",
              blocked && "opacity-50",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-forest bg-forest text-white",
                active && !done && "border-step bg-step text-white",
                future && !blocked && "border-border bg-muted/50 text-muted-foreground",
                blocked && "border-border border-dashed bg-transparent text-muted-foreground",
              )}
              aria-hidden
            >
              {done ? <CheckIcon className="size-3.5" /> : step.id}
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-medium leading-snug", active && "text-foreground")}>
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                  {step.description}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
