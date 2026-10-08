import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutGridIcon, TableIcon } from "lucide-react"
import { cn } from "cn"

import { useWorkspace } from "@/app/WorkspaceProvider"
import { AdvisorBlock, EvidenceCard } from "@/components/grove/companion/advisor-block"
import { SuggestedPrompts } from "@/components/grove/companion/suggested-prompts"
import { TaxonomyComposer } from "@/components/grove/companion/taxonomy-composer"
import { TaxonomyEcosystemMap } from "@/components/grove/organic/taxonomy-ecosystem-map"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { filterSkillTaxonomyTree, getSkillTaxonomyTree } from "@/data/taxonomy/skill-taxonomy"
import { MVP_COMPETENCY_CODE } from "@/data/taxonomy"
import { adviseOnNode, summarizeTaxonomy } from "@/lib/taxonomy-advisor"
import { flattenTaxonomyRows, findNodePath } from "@/lib/taxonomy-tree-utils"

export function TaxonomyMapPage() {
  const navigate = useNavigate()
  const { competencies, scopeCodes } = useWorkspace()
  const [competencyCode, setCompetencyCode] = useState(scopeCodes[0] ?? MVP_COMPETENCY_CODE)
  const [draftQuery, setDraftQuery] = useState("")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [view, setView] = useState<"map" | "table">("map")

  const competency = competencies.find((c) => c.code === competencyCode)
  const competencyName = competency?.name ?? competencyCode
  const fullTree = useMemo(() => getSkillTaxonomyTree(competencyCode), [competencyCode])
  const tree = useMemo(() => filterSkillTaxonomyTree(fullTree, query), [fullTree, query])
  const tableRows = useMemo(() => flattenTaxonomyRows(tree), [tree])
  const overview = useMemo(() => summarizeTaxonomy(competencyName, fullTree), [competencyName, fullTree])

  const selectionPath = useMemo(() => {
    if (!selectedId) return null
    const path = findNodePath(fullTree, selectedId)
    if (!path) return null
    return { path, node: path[path.length - 1] }
  }, [fullTree, selectedId])

  const selectionAdvice = useMemo(
    () => (selectionPath ? adviseOnNode(selectionPath.path) : null),
    [selectionPath],
  )

  const scopedCompetencies = competencies.filter((c) => scopeCodes.includes(c.code))

  const prompts = useMemo(
    () => [
      {
        id: "clear",
        label: "Show full taxonomy",
        onSelect: () => {
          setDraftQuery("")
          setQuery("")
        },
      },
      {
        id: "sql",
        label: "Where is SQL covered?",
        onSelect: () => {
          setDraftQuery("SQL")
          setQuery("SQL")
        },
      },
      {
        id: "story",
        label: "Storytelling & influence skills",
        onSelect: () => {
          setDraftQuery("story")
          setQuery("story")
        },
      },
      {
        id: "behavioral",
        label: "Filter behavioral skills",
        onSelect: () => {
          setDraftQuery("stakeholder")
          setQuery("stakeholder")
        },
      },
      {
        id: "benchmark",
        label: "Publish a benchmark",
        onSelect: () => navigate("/competencies/benchmark"),
      },
    ],
    [navigate],
  )

  return (
    <div className="flex min-h-[calc(100vh-var(--grove-topbar-height,72px)-3rem)] flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-6">
      <aside className="flex flex-col gap-4 lg:max-h-[calc(100vh-var(--grove-topbar-height,72px)-4rem)] lg:overflow-y-auto" aria-label="Advisor">
        <header>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Taxonomy advisor</p>
          <h1 className="font-heading mt-1 text-xl font-semibold tracking-tight">Skill library</h1>
        </header>

        <Select value={competencyCode} onValueChange={(v) => v && setCompetencyCode(v)}>
          <SelectTrigger className="w-full" aria-label="Competency scope">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopedCompetencies.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AdvisorBlock label="Interpretation">
          <p>{overview.summary}</p>
          <EvidenceCard title="Evidence">
            {overview.totalSkills} skills · {overview.domainStats.length} domains · {overview.technical} technical ·{" "}
            {overview.behavioral} behavioral
          </EvidenceCard>
        </AdvisorBlock>

        <AdvisorBlock label="Recommendation">
          <p>{overview.recommendation}</p>
        </AdvisorBlock>

        {selectionAdvice && selectionPath && (
          <AdvisorBlock
            label="Your selection"
            footer={
              selectionAdvice.action ? (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Suggested next step: </span>
                  {selectionAdvice.action}
                </p>
              ) : undefined
            }
          >
            <p>{selectionAdvice.summary}</p>
            <EvidenceCard title="Evidence">{selectionAdvice.evidence}</EvidenceCard>
          </AdvisorBlock>
        )}

        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">Try asking</p>
          <SuggestedPrompts prompts={prompts} />
        </div>

        <TaxonomyComposer
          value={draftQuery}
          onChange={setDraftQuery}
          onSubmit={() => setQuery(draftQuery)}
          competencyLabel={competencyName}
        />

        <Button type="button" variant="outline" size="sm" onClick={() => navigate("/competencies")}>
          Open benchmark catalogue
        </Button>
      </aside>

      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {query
              ? `Showing skills matching “${query}” in the evidence view.`
              : "Full taxonomy evidence—select a node to refine the advisor."}
          </p>
          <div className="flex rounded-lg border border-border/70 p-0.5" role="group" aria-label="Evidence view">
            <Button
              type="button"
              size="sm"
              variant={view === "map" ? "secondary" : "ghost"}
              className="h-8 gap-1 px-2"
              onClick={() => setView("map")}
            >
              <LayoutGridIcon className="size-3.5" aria-hidden />
              Map
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              className="h-8 gap-1 px-2"
              onClick={() => setView("table")}
            >
              <TableIcon className="size-3.5" aria-hidden />
              Table
            </Button>
          </div>
        </div>

        <section
          className={cn(
            "min-h-[18rem] flex-1 overflow-auto rounded-xl border border-border/70 bg-card",
            view === "map" && "bg-gradient-to-br from-muted/30 via-card to-[var(--grove-positive-soft)]/10 p-4",
            view === "table" && "p-0",
          )}
          aria-label="Taxonomy evidence"
        >
          {view === "map" ? (
            tree.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No skills match that filter. Try a broader term or clear the filter.
              </p>
            ) : (
              <TaxonomyEcosystemMap
                domains={tree}
                selectedId={selectedId}
                onSelect={setSelectedId}
                zoom="fit"
              />
            )
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map(({ node, depth }) => (
                  <TableRow
                    key={node.id}
                    className={cn("cursor-pointer", selectedId === node.id && "bg-muted/50")}
                    onClick={() => setSelectedId(node.id)}
                  >
                    <TableCell className="font-medium" style={{ paddingLeft: `${8 + depth * 12}px` }}>
                      {node.label}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{node.kind}</TableCell>
                    <TableCell className="text-muted-foreground">{node.skillType ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  )
}
