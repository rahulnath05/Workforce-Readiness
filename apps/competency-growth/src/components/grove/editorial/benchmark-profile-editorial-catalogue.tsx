import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import type { ProfileCatalogueRow } from "@/domain/selectors"
import type { DesignationLevelMeta } from "@/domain/types"
import type { RoleLevel } from "@/domain/types"
import { formatProficiencyShort } from "@/domain/proficiency"
import { Button } from "@/components/ui/button"

export function BenchmarkCatalogueSectionNav({
  chapters,
}: {
  chapters: { id: string; title: string; count: number }[]
}) {
  if (!chapters.length) return null
  return (
    <nav aria-label="Catalogue chapters" className="border-y border-border/70 py-4">
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

export function BenchmarkProfileEditorialCatalogue({
  groups,
  collapsedGroups,
  onToggleGroup,
  expandedProfileId,
  onToggleDetail,
  canEdit,
  onEditProfile,
}: {
  groups: {
    designation: RoleLevel
    meta: DesignationLevelMeta | undefined
    rows: ProfileCatalogueRow[]
  }[]
  collapsedGroups: Set<string>
  onToggleGroup: (designation: RoleLevel) => void
  expandedProfileId: string | null
  onToggleDetail: (profileId: string) => void
  canEdit: boolean
  onEditProfile: (profileId: string) => void
}) {
  const navItems = groups.map((g) => ({
    id: `designation-${g.designation.replace(/\s+/g, "-").toLowerCase()}`,
    title: g.designation,
    count: g.rows.length,
  }))

  return (
    <div className="space-y-12">
      <BenchmarkCatalogueSectionNav chapters={navItems} />
      {groups.map((group) => {
        const collapsed = collapsedGroups.has(group.designation)
        const publishedInGroup = group.rows.filter((r) => r.publishStatus === "Published").length
        const sectionId = `designation-${group.designation.replace(/\s+/g, "-").toLowerCase()}`
        return (
          <section key={group.designation} id={sectionId} className="scroll-mt-24 border-t border-border/80 pt-10">
            <button
              type="button"
              className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-left"
              aria-expanded={!collapsed}
              onClick={() => onToggleGroup(group.designation)}
            >
              <ChevronDownIcon
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")}
                aria-hidden
              />
              <h3 className="font-heading text-xl font-semibold tracking-tight">{group.designation}</h3>
              {group.meta && <span className="text-sm text-muted-foreground">{group.meta.yoeRange}</span>}
              <span className="text-sm text-muted-foreground">
                · {group.rows.length} profiles · {publishedInGroup}/{group.rows.length} published
              </span>
            </button>
            {!collapsed && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <caption className="mb-3 text-left text-[11px] text-muted-foreground">
                    Job profiles at {group.designation} designation
                  </caption>
                  <thead>
                    <tr className="border-b border-border/80 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 pr-4 font-medium">Profile</th>
                      <th className="pb-2 pr-4 font-medium">Benchmark</th>
                      <th className="pb-2 pr-4 font-medium">Cohort lead</th>
                      <th className="pb-2 pr-4 font-medium">Members</th>
                      <th className="pb-2 pr-4 font-medium">Readiness</th>
                      <th className="pb-2 pr-4 font-medium">At risk</th>
                      <th className="pb-2 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((pr) => (
                      <ProfileRows
                        key={pr.profile.id}
                        pr={pr}
                        detailOpen={expandedProfileId === pr.profile.id}
                        canEdit={canEdit}
                        onToggleDetail={() => onToggleDetail(pr.profile.id)}
                        onEdit={() => onEditProfile(pr.profile.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ProfileRows({
  pr,
  detailOpen,
  canEdit,
  onToggleDetail,
  onEdit,
}: {
  pr: ProfileCatalogueRow
  detailOpen: boolean
  canEdit: boolean
  onToggleDetail: () => void
  onEdit: () => void
}) {
  return (
    <Fragment>
      <tr className="border-b border-border/50">
        <td className="py-3 pr-4 align-top">
          <span className="block font-medium">{pr.profile.label}</span>
          {pr.profile.family && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{pr.profile.family}</span>
          )}
        </td>
        <td className="py-3 pr-4 align-top text-muted-foreground">
          {pr.publishStatus === "Published" ? (
            <span>v{pr.version?.version} · {pr.version?.planWindow ?? "90 days"}</span>
          ) : (
            "Not published"
          )}
        </td>
        <td className="py-3 pr-4 align-top">{pr.leadName}</td>
        <td className="py-3 pr-4 align-top tabular-nums">{pr.memberCount}</td>
        <td className="py-3 pr-4 align-top tabular-nums">
          {pr.memberCount > 0 ? `${pr.avgReadinessPct}%` : "—"}
        </td>
        <td
          className={cn(
            "py-3 pr-4 align-top tabular-nums",
            pr.atRiskCount > 0 && "font-medium text-[var(--grove-attention)]",
          )}
        >
          {pr.atRiskCount}
        </td>
        <td className="py-3 align-top text-right whitespace-nowrap">
          <button
            type="button"
            className="text-sm font-medium text-forest underline-offset-4 hover:underline"
            aria-expanded={detailOpen}
            onClick={onToggleDetail}
          >
            {detailOpen ? "Hide detail" : "View detail"}
          </button>
          {canEdit && (
            <>
              <span className="mx-1 text-muted-foreground">·</span>
              <button
                type="button"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                onClick={onEdit}
              >
                {pr.version ? "Update" : "Publish"}
              </button>
            </>
          )}
        </td>
      </tr>
      {detailOpen && (
        <tr>
          <td colSpan={7} className="border-b border-border/60 bg-[var(--grove-surface-subtle)]/25 px-0 py-4">
            <div className="grid gap-6 px-2 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Benchmark targets
                </p>
                {pr.version ? (
                  <table className="mt-3 w-full text-xs">
                    <tbody>
                      {pr.version.skills.map((s) => (
                        <tr key={s.name} className="border-b border-border/40">
                          <td className="py-1.5 pr-2">{s.name}</td>
                          <td className="py-1.5 text-right text-muted-foreground">
                            {formatProficiencyShort(s.targetProficiency)} · {s.targetProficiency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No published benchmark for this profile yet.</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Cohort snapshot
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Cohort</dt>
                    <dd className="font-medium">{pr.cohort?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lead</dt>
                    <dd className="font-medium">{pr.leadName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Members</dt>
                    <dd className="font-medium">{pr.memberCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg readiness</dt>
                    <dd className="font-medium">{pr.memberCount > 0 ? `${pr.avgReadinessPct}%` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">At risk</dt>
                    <dd className="font-medium">{pr.atRiskCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Family</dt>
                    <dd className="font-medium">{pr.profile.family ?? "—"}</dd>
                  </div>
                </dl>
                {pr.cohort && (
                  <Button
                    type="button"
                    variant="link"
                    className="mt-3 h-auto p-0 text-forest"
                    render={<Link to={`/cohorts/${pr.cohort.id}`} />}
                  >
                    Open cohort report
                  </Button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}
