import { useMemo, useState } from "react"
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { filterSkillTaxonomyTree, getSkillTaxonomyTree } from "@/data/taxonomy"
import type { SkillTaxonomyNode } from "@/data/taxonomy/skill-taxonomy.types"
import { cn } from "@/lib/utils"

export function TaxonomySkillPicker({
  competencyCode,
  excludeNames,
  onSelect,
  disabled,
}: {
  competencyCode: string
  excludeNames: Set<string>
  onSelect: (skill: { name: string; skillType: string }) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const tree = useMemo(() => getSkillTaxonomyTree(competencyCode), [competencyCode])
  const filtered = useMemo(() => filterSkillTaxonomyTree(tree, query), [tree, query])
  const searching = query.trim().length > 0

  function handlePick(skill: { name: string; skillType: string }) {
    onSelect(skill)
    setOpen(false)
    setQuery("")
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        disabled={disabled || !tree.length}
        onClick={() => setOpen(true)}
      >
        Add from taxonomy
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(560px,90vh)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-4 py-3">
            <DialogTitle className="text-base">Skill taxonomy</DialogTitle>
            <DialogDescription className="text-xs">
              {competencyCode} · browse domains and categories, then select a skill to add.
            </DialogDescription>
          </DialogHeader>
          <div className="shrink-0 border-b px-4 py-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills…"
                className="pl-8"
                aria-label="Search taxonomy"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {!filtered.length ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No skills match your search.
              </p>
            ) : (
              <ul className="space-y-0.5" role="tree" aria-label="Skill taxonomy">
                {filtered.map((node) => (
                  <TaxonomyTreeBranch
                    key={node.id}
                    node={node}
                    depth={0}
                    defaultExpanded={searching}
                    excludeNames={excludeNames}
                    onSelect={handlePick}
                  />
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TaxonomyTreeBranch({
  node,
  depth,
  defaultExpanded,
  excludeNames,
  onSelect,
}: {
  node: SkillTaxonomyNode
  depth: number
  defaultExpanded: boolean
  excludeNames: Set<string>
  onSelect: (skill: { name: string; skillType: string }) => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 1)
  const isSkill = node.kind === "skill"
  const isTaken = isSkill && excludeNames.has(node.label)
  const hasChildren = Boolean(node.children?.length)

  if (isSkill) {
    return (
      <li role="treeitem" className="list-none">
        <button
          type="button"
          disabled={isTaken}
          onClick={() =>
            onSelect({ name: node.label, skillType: node.skillType ?? "Technical" })
          }
          className={cn(
            "flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors",
            isTaken
              ? "cursor-not-allowed text-muted-foreground/60"
              : "hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          style={{ paddingLeft: `${depth * 12 + 28}px` }}
        >
          <span className="min-w-0 flex-1 truncate font-medium">{node.label}</span>
          {isTaken ? (
            <span className="shrink-0 text-[10px] text-muted-foreground">Added</span>
          ) : (
            <span className="shrink-0 text-[10px] text-muted-foreground">{node.skillType ?? "Technical"}</span>
          )}
        </button>
      </li>
    )
  }

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined} className="list-none">
      <button
        type="button"
        onClick={() => hasChildren && setExpanded((e) => !e)}
        className="flex w-full items-center gap-1 rounded-md py-1.5 pr-2 text-left text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span
          className={cn(
            "min-w-0 truncate",
            node.kind === "domain" ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
          )}
        >
          {node.label}
        </span>
      </button>
      {hasChildren && expanded && (
        <ul role="group" className="space-y-0.5">
          {node.children!.map((child) => (
            <TaxonomyTreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
              excludeNames={excludeNames}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
