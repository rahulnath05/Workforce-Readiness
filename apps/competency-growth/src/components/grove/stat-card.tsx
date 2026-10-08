import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({
  label,
  value,
  hint,
  tone = "light",
  children,
}: {
  label: string
  value: string
  hint: string
  tone?: "light" | "dark"
  children?: ReactNode
}) {
  const dark = tone === "dark"
  return (
    <Card className={cn("rounded-[var(--grove-radius-panel)] shadow-none", dark && "border-transparent bg-forest-deep text-white")}>
      <CardHeader>
        <CardDescription className={cn(dark && "text-white/70")}>{label}</CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p className={cn("text-xs", dark ? "text-white/70" : "text-muted-foreground")}>{hint}</p>
        {children}
      </CardContent>
    </Card>
  )
}
