import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function Journey({
  title,
  steps,
}: {
  title: string
  steps: { label: string; hint: string; state: "done" | "current" | "later" }[]
}) {
  return (
    <Card className="rounded-[var(--grove-radius-panel)] border shadow-none">
      <CardContent className="flex flex-col gap-3 pt-(--card-spacing)">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
        <ol className="grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-start gap-2">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  step.state === "done" && "bg-forest text-white",
                  step.state === "current" && "bg-step text-white",
                  step.state === "later" && "bg-muted text-muted-foreground",
                )}
              >
                {step.state === "done" ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span>
                <span className="block text-sm font-medium">{step.label}</span>
                <span className="block text-xs text-muted-foreground">{step.hint}</span>
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
