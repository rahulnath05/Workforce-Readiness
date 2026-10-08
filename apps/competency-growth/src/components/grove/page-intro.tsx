import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function PageIntro({
  eyebrow,
  title,
  lede,
  aside,
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  eyebrow: string
  title: string
  lede: string
  aside?: ReactNode
  primary?: string
  secondary?: string
  onPrimary?: () => void
  onSecondary?: () => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
        <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lede}</p>
      </div>
      <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
        {aside}
        {(secondary || primary) && (
          <div className="flex flex-wrap gap-2">
            {secondary && (
              <Button type="button" variant="outline" onClick={onSecondary}>
                {secondary}
              </Button>
            )}
            {primary && (
              <Button type="button" onClick={onPrimary}>
                {primary}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
