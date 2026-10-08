import { useNavigate } from "react-router-dom"
import { ArrowRightIcon, ClipboardCheckIcon } from "lucide-react"
import { cn } from "cn"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportCardRecord } from "@/domain/types"
import type { PersonRecord } from "@/domain/types"

const VERDICT_STYLES: Record<
  ReportCardRecord["verdict"],
  { bar: string; badge: string }
> = {
  Success: {
    bar: "bg-forest",
    badge: "bg-[var(--grove-positive-soft)] text-forest border-forest/20",
  },
  Partial: {
    bar: "bg-step",
    badge: "bg-[var(--grove-warning-soft)] text-[var(--grove-warning)] border-[var(--grove-warning)]/25",
  },
  Fail: {
    bar: "bg-[var(--grove-attention)]",
    badge: "bg-[var(--grove-attention-soft)] text-[var(--grove-attention)] border-[var(--grove-attention)]/25",
  },
}

export function ReviewQueuePanel({
  queue,
  people,
}: {
  queue: ReportCardRecord[]
  people: PersonRecord[]
}) {
  const navigate = useNavigate()

  if (!queue.length) return null

  return (
    <Card className="overflow-hidden rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-forest/10">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 bg-[var(--grove-positive-soft)]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-forest/10 text-forest">
            <ClipboardCheckIcon className="size-4" aria-hidden />
          </span>
          <CardTitle className="font-heading text-base">Sign-off queue</CardTitle>
        </div>
        <Badge className="bg-forest text-white tabular-nums">{queue.length}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {queue.map((card, index) => {
            const person = people.find((p) => p.id === card.personId)
            const styles = VERDICT_STYLES[card.verdict]
            return (
              <li key={card.id}>
                <div
                  className={cn(
                    "group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40",
                    index === 0 && "bg-step/5",
                  )}
                >
                  <div className={cn("w-1 self-stretch rounded-full", styles.bar)} aria-hidden />
                  <Avatar size="lg">
                    <AvatarFallback
                      style={{
                        background: person?.tint ?? "var(--grove-neutral-soft)",
                        color: "var(--grove-ink)",
                      }}
                    >
                      {person?.initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{person?.name ?? card.personId}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px]", styles.badge)}>
                        {card.verdict}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{card.date}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 gap-1 bg-forest hover:bg-forest/90"
                    onClick={() => navigate(`/people/${card.personId}/report-card`)}
                  >
                    Review
                    <ArrowRightIcon className="size-3.5 opacity-80" aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
