import type { CohortRosterLine } from "@/domain/cohort-model"
import type { PersonStatus } from "@/domain/types"
import { TeamStatusBadge } from "@/components/status-badge"

const CHAPTERS: { status: PersonStatus; id: string; title: string; caption: string }[] = [
  {
    status: "Behind",
    id: "cohort-behind",
    title: "Behind plan",
    caption: "Learners who may need a cohort nudge or manager follow-up before the next checkpoint.",
  },
  {
    status: "Failed",
    id: "cohort-failed",
    title: "Cycle ended",
    caption: "Closed cycles that may need remediation or a revised learning plan.",
  },
  {
    status: "On track",
    id: "cohort-on-track",
    title: "On track",
    caption: "Steady progress against published targets—monitor through periodic roll-ups.",
  },
  {
    status: "Completed",
    id: "cohort-completed",
    title: "Completed",
    caption: "Benchmark met for this cycle; confirm report cards where applicable.",
  },
]

export function CohortEditorialRoster({
  roster,
  onOpenMember,
}: {
  roster: CohortRosterLine[]
  onOpenMember?: (memberId: string) => void
}) {
  const chapters = CHAPTERS
    .map((ch) => ({
      ...ch,
      members: roster.filter((m) => m.status === ch.status),
    }))
    .filter((ch) => ch.members.length > 0)

  const navItems = chapters.map((ch) => ({ id: ch.id, title: ch.title, count: ch.members.length }))

  if (!roster.length) {
    return (
      <p className="border-t border-border/70 py-10 text-center text-sm text-muted-foreground">
        No learners are assigned to this profile yet. Assign cohort membership from the people directory.
      </p>
    )
  }

  return (
    <div className="space-y-12">
      {navItems.length > 1 && (
        <nav aria-label="Roster chapters" className="border-y border-border/70 py-4">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">On this page</p>
          <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {navItems.map((ch) => (
              <li key={ch.id}>
                <a href={`#${ch.id}`} className="text-foreground/80 underline-offset-4 hover:text-forest hover:underline">
                  {ch.title}
                  <span className="ml-1 tabular-nums text-muted-foreground">({ch.count})</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="scroll-mt-24 border-t border-border/80 pt-10 first:border-t-0 first:pt-0">
          <h3 className="font-heading text-xl font-semibold tracking-tight">{chapter.title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{chapter.caption}</p>
          <div className="mt-6 overflow-x-auto">
            <div className="max-h-[min(28rem,70vh)] overflow-y-auto border border-border/70">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <caption className="sr-only">{chapter.title} learners</caption>
                <thead className="sticky top-0 z-[1] bg-background">
                  <tr className="border-b border-border/80 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <th className="px-3 py-2.5 pr-4 font-medium">Member</th>
                    <th className="px-3 py-2.5 pr-4 font-medium">Designation</th>
                    <th className="px-3 py-2.5 pr-4 font-medium">Status</th>
                    <th className="px-3 py-2.5 pr-4 font-medium">Progress</th>
                    <th className="px-3 py-2.5 font-medium">Due</th>
                    {onOpenMember && (
                      <th className="px-3 py-2.5 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {chapter.members.map((m) => {
                    const canOpen = onOpenMember && !m.id.startsWith("synthetic-")
                    return (
                      <tr key={m.id} className="border-b border-border/50">
                        <td className="px-3 py-3 pr-4 align-top font-medium">{m.name}</td>
                        <td className="px-3 py-3 pr-4 align-top text-muted-foreground">{m.role}</td>
                        <td className="px-3 py-3 pr-4 align-top">
                          <TeamStatusBadge status={m.status} />
                        </td>
                        <td className="px-3 py-3 pr-4 align-top tabular-nums">{m.progress}%</td>
                        <td className="px-3 py-3 align-top text-muted-foreground">{m.due}</td>
                        {onOpenMember && (
                          <td className="px-3 py-3 align-top text-right">
                            {canOpen ? (
                              <button
                                type="button"
                                className="text-sm font-medium text-forest underline-offset-4 hover:underline"
                                onClick={() => onOpenMember(m.id)}
                              >
                                Open profile
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Demo row</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {chapter.members.length} row{chapter.members.length === 1 ? "" : "s"} · Progress vs published benchmark
          </p>
        </section>
      ))}
    </div>
  )
}
