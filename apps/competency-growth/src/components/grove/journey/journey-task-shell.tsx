import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function JourneyTaskShell({
  title,
  purpose,
  effortLabel,
  stepIndex,
  stepTotal,
  onSaveAndExit,
  headerLink,
  mobileProgress,
  contextRail,
  children,
  footer,
}: {
  title: string
  purpose: string
  effortLabel?: string
  stepIndex: number
  stepTotal: number
  onSaveAndExit: () => void
  /** Replaces default benchmark catalogue link (e.g. manager coachee directory). */
  headerLink?: { to: string; label: string }
  /** Shown below the header on narrow viewports when the context rail is hidden. */
  mobileProgress?: ReactNode
  contextRail?: ReactNode
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-var(--grove-topbar-height,72px)-3rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onSaveAndExit}>
          Save & exit
        </Button>
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          Step {stepIndex} of {stepTotal}
        </p>
        {headerLink ? (
          <Link to={headerLink.to} className="text-xs font-medium text-forest hover:underline">
            {headerLink.label}
          </Link>
        ) : (
          <Link to="/competencies" className="text-xs font-medium text-forest hover:underline">
            Benchmark catalogue
          </Link>
        )}
      </div>
      {mobileProgress && <div className="border-b border-border/50 py-3 lg:hidden">{mobileProgress}</div>}

      <div className="grid flex-1 gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
        <div className="flex min-w-0 flex-col">
          <header className="max-w-2xl">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{purpose}</p>
            {effortLabel && (
              <p className="mt-2 text-[11px] text-muted-foreground">Estimated time: {effortLabel}</p>
            )}
          </header>
          <div className="mt-6 min-h-0 flex-1">{children}</div>
        </div>
        {contextRail && (
          <aside className="hidden border-l border-border/60 pl-6 lg:block" aria-label="Journey progress">
            {contextRail}
          </aside>
        )}
      </div>

      <div
        className="sticky bottom-0 -mx-4 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6"
      >
        {footer}
      </div>
    </div>
  )
}

export function JourneyPreparationCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="mb-6 rounded-lg border border-border/80 bg-[var(--grove-surface-subtle)]/60 px-4 py-3">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}
