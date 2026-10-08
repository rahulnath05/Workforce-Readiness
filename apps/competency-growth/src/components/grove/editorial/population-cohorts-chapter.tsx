import { Link } from "react-router-dom"

import type { Cohort } from "@/domain/types"

export function PopulationCohortsChapter({
  cohorts,
  memberCountByCohortId,
}: {
  cohorts: Cohort[]
  memberCountByCohortId: Record<string, number>
}) {
  if (!cohorts.length) {
    return (
      <section aria-labelledby="cohorts-chapter-heading" className="border-t border-border/80 pt-10">
        <h2 id="cohorts-chapter-heading" className="font-heading text-lg font-semibold tracking-tight">
          Profile cohorts
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          No cohorts yet. Create one from a job profile to group learners for readiness reporting.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="cohorts-chapter-heading" className="border-t border-border/80 pt-10">
      <h2 id="cohorts-chapter-heading" className="font-heading text-lg font-semibold tracking-tight">
        Profile cohorts
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        One cohort per job profile pattern. Open a cohort for lead assignment, member list, and exception views.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <caption className="mb-3 text-left text-[11px] text-muted-foreground">Cohorts in competency scope</caption>
          <thead>
            <tr className="border-b border-border/80 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className="pb-2 pr-4 font-medium">Cohort</th>
              <th className="pb-2 pr-4 font-medium">Members</th>
              <th className="pb-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="py-3 pr-4 align-top font-medium">{c.name}</td>
                <td className="py-3 pr-4 align-top tabular-nums text-muted-foreground">
                  {memberCountByCohortId[c.id] ?? 0}
                </td>
                <td className="py-3 align-top text-right">
                  <Link
                    to={`/cohorts/${c.id}`}
                    className="text-sm font-medium text-forest underline-offset-4 hover:underline"
                  >
                    Open cohort
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
