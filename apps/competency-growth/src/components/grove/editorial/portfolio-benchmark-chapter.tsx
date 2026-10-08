import { CheckIcon } from "lucide-react"
import { cn } from "cn"

import type { JourneyStep } from "@/domain/types"

export function PortfolioBenchmarkChapter({ title, steps }: { title: string; steps: JourneyStep[] }) {
  return (
    <section aria-labelledby="benchmark-chapter-title" className="border-y border-border/70 py-8">
      <h2 id="benchmark-chapter-title" className="font-heading text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <ol className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        {steps.map((step, index) => (
          <li key={step.label} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                step.state === "done" && "border-forest bg-forest text-white",
                step.state === "current" && "border-step bg-step text-white",
                step.state === "later" && "border-border bg-transparent text-muted-foreground",
              )}
              aria-hidden
            >
              {step.state === "done" ? <CheckIcon className="size-3.5" /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug">{step.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{step.hint}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
