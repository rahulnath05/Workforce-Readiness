import { FileSpreadsheetIcon, FileTextIcon, TableIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EXPORT_PACKS } from "@/data/workforce/reports"

const FORMAT_ICONS = {
  PDF: FileTextIcon,
  XLSX: FileSpreadsheetIcon,
  CSV: TableIcon,
} as const

export function ReportsExportPanel() {
  return (
    <Card className="rounded-[var(--grove-radius-panel)] shadow-none ring-1 ring-border/80">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="font-heading text-base">Export narrative</CardTitle>
        <p className="text-[11px] text-muted-foreground">Board-ready packs for this scope</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-3">
        {EXPORT_PACKS.map((pack) => {
          const Icon = FORMAT_ICONS[pack.format]
          return (
            <button
              key={pack.id}
              type="button"
              className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
              onClick={() =>
                toast.success("Export queued", {
                  description: `${pack.label} · ${pack.format}`,
                })
              }
            >
              <Icon className="size-4 shrink-0 text-forest" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pack.label}</p>
                <p className="text-[10px] text-muted-foreground">{pack.updated}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">{pack.format}</Badge>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
