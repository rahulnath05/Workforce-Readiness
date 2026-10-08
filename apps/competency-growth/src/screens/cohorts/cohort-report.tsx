import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { PageIntro } from "@/components/grove/page-intro"
import { TeamStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildCohortRosterDisplay, cohortRosterMembers } from "@/domain/cohort-model"
import { buildProfileCatalogue } from "@/domain/selectors"
import { getJobProfile } from "@/fixtures/designation-matrix"

export function CohortReportPage() {
  const { cohortId } = useParams()
  const navigate = useNavigate()
  const { cohorts, people, benchmarkVersions } = useWorkspace()

  const cohort = cohorts.find((c) => c.id === cohortId)
  const profile = cohort ? getJobProfile(cohort.jobProfileId) : undefined
  const roster = cohort ? cohortRosterMembers(people, cohort) : []
  const lead = cohort ? people.find((p) => p.id === cohort.leadPersonId) : undefined

  const catalogueRow = useMemo(() => {
    if (!cohort) return undefined
    return buildProfileCatalogue(cohort.competencyCode, benchmarkVersions, cohorts, people).find(
      (r) => r.profile.id === cohort.jobProfileId,
    )
  }, [cohort, benchmarkVersions, cohorts, people])

  const headcount = catalogueRow?.memberCount ?? roster.length
  const atRisk = catalogueRow?.atRiskCount ?? 0
  const readinessPct = catalogueRow?.overallReadinessPct
  const readiness =
    readinessPct !== null && readinessPct !== undefined ? `${readinessPct}%` : "—"

  const displayRoster = useMemo(() => {
    if (!cohort) return []
    const sampleProgress = roster.length
      ? Math.round(roster.reduce((s, p) => s + p.progress, 0) / roster.length)
      : readinessPct ?? 68
    return buildCohortRosterDisplay(people, cohort, headcount, {
      atRiskCount: atRisk,
      avgProgress: sampleProgress,
    })
  }, [cohort, people, headcount, atRisk, roster, readinessPct])

  if (!cohort || !profile) {
    return <p className="text-sm text-muted-foreground">Cohort not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <PageIntro
        eyebrow="Cohort report pack"
        title={profile.label}
        lede={`${cohort.designationLevel} · ${headcount} learners · ${atRisk} at risk · ${readiness} readiness vs benchmark`}
        aside={
          <p className="text-sm whitespace-nowrap text-muted-foreground">
            Cohort lead{" "}
            <span className="font-medium text-foreground">{lead?.name ?? "Unassigned"}</span>
          </p>
        }
        primary="Nudge cohort"
        onPrimary={() =>
          toast.success("Nudge sent", { description: `${profile.label} cohort — ${headcount} learners` })
        }
      />

      <Card className="rounded-[var(--grove-radius-panel)] shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Learner roster</CardTitle>
          <CardDescription>{headcount} learners on this job profile</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRoster.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>
                    <TeamStatusBadge
                      status={
                        m.status === "On track" || m.status === "Completed"
                          ? "On track"
                          : "Behind"
                      }
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">{m.progress}%</TableCell>
                  <TableCell>{m.due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          {displayRoster.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No learners are assigned to this profile yet.
            </p>
          )}
          <div className="mt-4 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-forest"
              onClick={() => navigate("/competencies")}
            >
              View benchmark
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
