import type { PersonRecord, PersonStatus } from "@/domain/types"
import { getJobProfile } from "@/fixtures/designation-matrix"
import { TeamStatusBadge } from "@/components/status-badge"

const COACHEE_CHAPTERS: { status: PersonStatus; id: string; title: string; caption: string }[] = [
  {
    status: "Behind",
    id: "chapter-behind",
    title: "Behind plan",
    caption: "Coachees who may need a nudge or 1:1 before the next checkpoint.",
  },
  {
    status: "Failed",
    id: "chapter-failed",
    title: "Cycle ended",
    caption: "Closed cycles that still benefit from a constructive debrief.",
  },
  {
    status: "On track",
    id: "chapter-on-track",
    title: "On track",
    caption: "Steady progress against published benchmarks—light-touch monitoring.",
  },
  {
    status: "Completed",
    id: "chapter-completed",
    title: "Completed",
    caption: "Benchmark met; confirm report cards and recognition.",
  },
]

const POPULATION_CHAPTERS: { status: PersonStatus; id: string; title: string; caption: string }[] = [
  {
    status: "Behind",
    id: "chapter-behind",
    title: "Behind plan",
    caption: "Learners behind published benchmarks—coordinate with cohort leads before the next checkpoint.",
  },
  {
    status: "Failed",
    id: "chapter-failed",
    title: "Cycle ended",
    caption: "Closed cycles that may need remediation or a revised benchmark assignment.",
  },
  {
    status: "On track",
    id: "chapter-on-track",
    title: "On track",
    caption: "Steady progress within competency scope—monitor through cohort roll-ups.",
  },
  {
    status: "Completed",
    id: "chapter-completed",
    title: "Completed",
    caption: "Targets met; validate report cards and workforce reporting.",
  },
]

export function CoacheesSectionNav({
  chapters,
}: {
  chapters: { id: string; title: string; count: number }[]
}) {
  if (!chapters.length) return null
  return (
    <nav aria-label="Roster chapters" className="border-y border-border/70 py-4">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">On this page</p>
      <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {chapters.map((ch) => (
          <li key={ch.id}>
            <a href={`#${ch.id}`} className="text-foreground/80 underline-offset-4 hover:text-forest hover:underline">
              {ch.title}
              <span className="ml-1 tabular-nums text-muted-foreground">({ch.count})</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function CoacheesEditorialRoster({
  people,
  onSelect,
  variant = "coachee",
}: {
  people: PersonRecord[]
  onSelect: (person: PersonRecord) => void
  variant?: "coachee" | "population"
}) {
  const chapterOrder = variant === "population" ? POPULATION_CHAPTERS : COACHEE_CHAPTERS
  const chapters = chapterOrder
    .map((ch) => ({
      ...ch,
      members: people.filter((p) => p.status === ch.status),
    }))
    .filter((ch) => ch.members.length > 0)

  const navItems = chapters.map((ch) => ({ id: ch.id, title: ch.title, count: ch.members.length }))

  if (!people.length) {
    return (
      <p className="border-t border-border/70 py-10 text-center text-sm text-muted-foreground">
        {variant === "population"
          ? "No learners match the current filter. Clear search or adjust the competency scope from the header."
          : "No coachees match the current filter. Clear search or open the team review from Overview."}
      </p>
    )
  }

  return (
    <div className="space-y-12">
      <CoacheesSectionNav chapters={navItems} />
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="scroll-mt-24 border-t border-border/80 pt-10">
          <h3 className="font-heading text-xl font-semibold tracking-tight">{chapter.title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{chapter.caption}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <caption className="sr-only">{chapter.title} coachees</caption>
              <thead>
                <tr className="border-b border-border/80 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 pr-4 font-medium">Person</th>
                  <th className="pb-3 pr-4 font-medium">Job profile</th>
                  <th className="pb-3 pr-4 font-medium">Progress</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {chapter.members.map((person) => {
                  const profile = getJobProfile(person.jobProfileId)
                  return (
                    <tr key={person.id} className="border-b border-border/50">
                      <td className="py-4 pr-4 align-top">
                        <span className="block font-medium text-foreground">{person.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {person.role} · Focus: {person.focus}
                          {person.urgent ? " · Urgent" : ""}
                        </span>
                      </td>
                      <td className="py-4 pr-4 align-top text-muted-foreground">
                        {profile?.label ?? person.competencyCode}
                      </td>
                      <td className="py-4 pr-4 align-top tabular-nums">{person.progress}%</td>
                      <td className="py-4 pr-4 align-top">
                        <TeamStatusBadge status={person.status} />
                      </td>
                      <td className="py-4 align-top text-right">
                        <button
                          type="button"
                          className="text-sm font-medium text-forest underline-offset-4 hover:underline"
                          onClick={() => onSelect(person)}
                        >
                          Read profile
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Figure {chapter.id.replace("chapter-", "")} · {chapter.members.length} row
            {chapter.members.length === 1 ? "" : "s"} · Progress vs published benchmark targets
          </p>
        </section>
      ))}
    </div>
  )
}
