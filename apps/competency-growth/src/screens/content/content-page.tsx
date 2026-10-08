import { useWorkspace } from "@/app/WorkspaceProvider"
import { PageIntro } from "@/components/grove/page-intro"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CONTENT_LIBRARY } from "@/fixtures/shared"

export function ContentPage() {
  const { searchQuery } = useWorkspace()
  const rows = CONTENT_LIBRARY.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Content library"
        title="Learning resources"
        lede="Browse mapped content with skill, delivery type, and health status."
      />
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader>
          <CardTitle className="font-heading text-base">Resources</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Learners</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.title}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.skill}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.health}</TableCell>
                  <TableCell>{row.learners}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
