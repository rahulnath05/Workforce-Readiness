import type { ReactNode } from "react"

export function AdvisorBlock({
  label = "Advisor",
  children,
  footer,
}: {
  label?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <article className="rounded-lg border border-border/70 bg-card px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
      {footer && <div className="mt-3 border-t border-border/50 pt-3 text-sm">{footer}</div>}
    </article>
  )
}

export function EvidenceCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-medium text-muted-foreground">{title}</p>
      <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
