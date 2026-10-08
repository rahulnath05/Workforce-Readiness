import { useState } from "react"
import { toast } from "sonner"
import {
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import type { Preview } from "@/components/data-frame"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { personas, type Persona } from "@/fixtures"
import { CandidateHome } from "@/screens/candidate-screens"
import { ContentLibrary, LdHome } from "@/screens/ld-screens"
import { CompetencyList, LeaderHome } from "@/screens/leader-screens"
import { ManagerHome } from "@/screens/manager-screens"

type Workspace = "overview" | "competencies" | "people" | "reports" | "content"

const previews: { id: Preview; label: string }[] = [
  { id: "ready", label: "Ready" },
  { id: "empty", label: "Empty" },
  { id: "loading", label: "Loading" },
  { id: "error", label: "Error" },
]

export function App() {
  const [preview, setPreview] = useState<Preview>("ready")
  const [persona, setPersona] = useState<Persona>("leader")
  const [workspace, setWorkspace] = useState<Workspace>("overview")
  const [query, setQuery] = useState("")
  const current = personas.find((item) => item.id === persona) ?? personas[0]

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar className="border-sidebar-border pb-14">
          <SidebarHeader className="gap-3 p-3">
            <div className="flex items-center gap-2 px-1 text-sidebar-foreground">
              <Mark />
              <span className="text-base font-semibold tracking-tight">Aptora</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl bg-sidebar-accent px-2 py-2 text-left text-sidebar-foreground"
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback style={{ background: current.tint, color: "oklch(0.25 0.03 165)" }}>
                    {current.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{current.label}</span>
                  <span className="block truncate text-xs text-sidebar-foreground/70">Aurne Corporation</span>
                </span>
                <ChevronDownIcon className="size-4 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {personas.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => {
                      setPersona(item.id)
                      setWorkspace("overview")
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/60">Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavItem icon={LayoutDashboardIcon} label="Overview" active={workspace === "overview"} onClick={() => setWorkspace("overview")} />
                  <NavItem icon={BookOpenIcon} label="Competencies" active={workspace === "competencies"} onClick={() => setWorkspace("competencies")} />
                  <NavItem icon={UsersIcon} label="People" badge="248" active={workspace === "people"} onClick={() => setWorkspace("people")} />
                  <NavItem icon={LayoutDashboardIcon} label="Reports" active={workspace === "reports"} onClick={() => setWorkspace("reports")} />
                  <NavItem icon={LibraryIcon} label="Content library" active={workspace === "content"} onClick={() => setWorkspace("content")} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto px-3 pb-3">
              <div className="rounded-xl bg-sidebar-accent p-3 text-sidebar-foreground">
                <p className="text-sm font-medium">Need help?</p>
                <p className="mt-1 text-xs text-sidebar-foreground/70">Explore guides for the current workspace.</p>
                <button type="button" className="mt-2 text-xs font-medium underline-offset-4 hover:underline" onClick={() => toast("Resource center opens in a later review")}>
                  Open resource center
                </button>
              </div>
            </div>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar size="sm">
                <AvatarFallback style={{ background: current.tint, color: "oklch(0.25 0.03 165)" }}>
                  {current.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{current.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">{current.role}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0 bg-background">
          <header className="flex items-center gap-3 border-b px-4 py-3 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search people, skills or competencies"
                aria-label="Search people, skills or competencies"
                className="rounded-full bg-card pl-8"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast("No new notifications")}>
              <BellIcon />
            </Button>
            <p className="hidden text-sm text-muted-foreground sm:block">Thursday, May 22</p>
          </header>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 pb-36 md:p-6 md:pb-32">
            <div className="flex flex-wrap gap-2">
              {personas.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={persona === item.id ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => {
                    setPersona(item.id)
                    setWorkspace("overview")
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {workspace === "overview" && persona === "leader" && (
              <LeaderHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "overview" && persona === "candidate" && (
              <CandidateHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "overview" && persona === "manager" && (
              <ManagerHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "overview" && persona === "ld" && (
              <LdHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "competencies" && <CompetencyList query={query} />}
            {workspace === "people" && (
              <ManagerHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "reports" && (
              <LeaderHome preview={preview} onRetry={() => setPreview("ready")} query={query} />
            )}
            {workspace === "content" && <ContentLibrary query={query} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Preview</span>
          {previews.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={preview === item.id ? "default" : "outline"}
              onClick={() => setPreview(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof LayoutDashboardIcon
  label: string
  active: boolean
  badge?: string
  onClick: () => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton type="button" isActive={active} onClick={onClick}>
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  )
}

function Mark() {
  return (
    <span className="relative size-5" aria-hidden="true">
      <span className="absolute top-0 left-0 size-2.5 rounded-sm bg-chart-3" />
      <span className="absolute right-0 bottom-1 size-2 rounded-sm bg-step" />
      <span className="absolute bottom-0 left-1.5 size-2 rounded-sm bg-heat-3" />
    </span>
  )
}

export default App
