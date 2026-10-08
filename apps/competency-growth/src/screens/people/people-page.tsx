import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { proficiencyIndex } from "@/domain/proficiency"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { PageIntro } from "@/components/grove/page-intro"
import { TeamStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildCohortForProfile } from "@/domain/cohort-model"
import type { PersonRecord } from "@/domain/types"
import { getJobProfiles } from "@/fixtures/designation-matrix"

export function PeoplePage() {
  const navigate = useNavigate()
  const {
    persona,
    people,
    scopedPeople,
    searchQuery,
    heatmapFilter,
    cohorts,
    assignPersonCohort,
    upsertCohort,
  } = useWorkspace()
  const [selected, setSelected] = useState<PersonRecord | null>(null)
  const [cohortDialog, setCohortDialog] = useState(false)
  const [newCohortProfileId, setNewCohortProfileId] = useState("da-analytics-manager")
  const daProfiles = getJobProfiles("DA")

  const list = useMemo(() => {
    const base = persona === "leader" ? scopedPeople : people
    const q = searchQuery.toLowerCase()
    return base.filter((p) => !q || `${p.name} ${p.focus} ${p.role}`.toLowerCase().includes(q))
  }, [persona, scopedPeople, people, searchQuery])

  const filterLabel = heatmapFilter.skill
    ? `Short on ${heatmapFilter.skill}${heatmapFilter.role ? ` · ${heatmapFilter.role}` : ""}`
    : heatmapFilter.jobProfileId
      ? getJobProfile(heatmapFilter.jobProfileId)?.label ?? "Job profile"
      : "All in scope"

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="People directory"
        title={persona === "leader" ? "Competency population" : "People"}
        lede={`${filterLabel} — ${list.length} people`}
        primary={persona === "leader" ? "Manage cohorts" : undefined}
        onPrimary={() => setCohortDialog(true)}
      />
      {persona === "leader" && (
        <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-base">Profile cohorts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {cohorts.map((c) => (
              <Button key={c.id} type="button" variant="outline" size="sm" onClick={() => navigate(`/cohorts/${c.id}`)}>
                {c.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{person.role}</TableCell>
                    <TableCell>
                      <div>{getJobProfile(person.jobProfileId)?.label ?? person.competencyCode}</div>
                      <div className="text-xs text-muted-foreground">{person.role}</div>
                    </TableCell>
                  <TableCell>{person.progress}%</TableCell>
                  <TableCell>
                    <TeamStatusBadge
                      status={
                        person.status === "Completed"
                          ? "Completed"
                          : person.status === "On track"
                            ? "On track"
                            : "Behind"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelected(person)}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>{selected?.role} · {selected?.competencyCode}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              {selected.skills.map((s) => (
                <div key={s.skill} className="text-sm">
                  <div className="flex justify-between">
                    <span>{s.skill}</span>
                    <span className="text-muted-foreground">Target {s.targetProficiency} · Assessed {s.assessedProficiency}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-forest"
                      style={{ width: `${Math.min(100, (proficiencyIndex(s.assessedProficiency) / proficiencyIndex(s.targetProficiency)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => toast.success("Nudge sent", { description: selected.name })}>
                  Nudge
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => toast.success("1:1 scheduled", { description: selected.name })}>
                  Schedule 1:1
                </Button>
                <Button type="button" size="sm" onClick={() => navigate(`/people/${selected.id}/report-card`)}>
                  Open report card
                </Button>
              </div>
              {persona === "leader" && (
                <div>
                  <Label>Cohort (one per person)</Label>
                  <Select
                    value={selected.cohortId ?? ""}
                    onValueChange={(v) => assignPersonCohort(selected.id, v || undefined)}
                  >
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {cohorts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={cohortDialog} onOpenChange={setCohortDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create profile cohort</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Job profile</Label>
              <Select value={newCohortProfileId} onValueChange={(v) => v && setNewCohortProfileId(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {daProfiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label} ({p.designationLevel})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                const profile = getJobProfile(newCohortProfileId)
                if (!profile) return
                upsertCohort(buildCohortForProfile(profile, "sanjay"))
                setCohortDialog(false)
              }}
            >
              Save cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
