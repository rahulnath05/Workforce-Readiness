import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  BellIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  MapIcon,
  NetworkIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react"

import { useWorkspace } from "@/app/WorkspaceProvider"
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
import { ChevronDownIcon, CheckIcon } from "lucide-react"

import { APP_NAME } from "@/lib/app-name"
import { isRouteAllowedForPersona } from "@/lib/persona-routes"

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    persona,
    personas,
    setPersona,
    searchQuery,
    setSearchQuery,
    people,
    directReports,
  } = useWorkspace()
  const current = personas.find((p) => p.id === persona) ?? personas[0]
  const isManager = persona === "manager"
  const showBuilderNav = !isManager && persona !== "leader"

  useEffect(() => {
    if (!isRouteAllowedForPersona(persona, location.pathname)) {
      navigate("/", { replace: true })
    }
  }, [persona, location.pathname, navigate])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar className="border-sidebar-border" style={{ width: "var(--grove-sidebar-width)" }}>
          <SidebarHeader className="gap-3 p-3">
            <div className="flex items-center gap-2 px-1 text-sidebar-foreground">
              <Mark />
              <span className="font-heading text-sm font-semibold leading-snug tracking-tight">
                {APP_NAME}
              </span>
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
                  <AvatarFallback style={{ background: current.tint, color: "var(--grove-ink)" }}>
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
                      navigate("/")
                    }}
                  >
                    <span className="flex flex-1 items-center justify-between gap-2">
                      <span>{item.label}</span>
                      {persona === item.id ? <CheckIcon className="size-4 text-forest" aria-hidden /> : null}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="gap-3 px-3 py-3">
              <SidebarGroupLabel className="h-auto px-1 py-0.5 text-[10px] tracking-wide text-sidebar-foreground/60 uppercase">
                Workspace
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <NavSidebar to="/" icon={LayoutDashboardIcon} label="Overview" />
                  {!isManager && (
                    <NavSidebar to="/competencies" icon={BookOpenIcon} label="Benchmarks" />
                  )}
                  <NavSidebar
                    to="/people"
                    icon={UsersIcon}
                    label="People"
                    badge={String(isManager ? directReports.length : people.length)}
                  />
                  <NavSidebar to="/reports" icon={LayoutDashboardIcon} label="Reports" />
                  {showBuilderNav && (
                    <>
                      <NavSidebar to="/taxonomy" icon={NetworkIcon} label="Taxonomy map" />
                      <NavSidebar to="/content" icon={LibraryIcon} label="Content library" />
                      <NavSidebar to="/assessment" icon={FlaskConicalIcon} label="Assessment lab" />
                      <NavSidebar to="/blueprint" icon={MapIcon} label="Blueprint" />
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar size="sm">
                <AvatarFallback style={{ background: current.tint, color: "var(--grove-ink)" }}>
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
          <header className="sticky top-0 z-30 flex h-[var(--grove-topbar-height,72px)] items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isManager ? "Search coachees or skills" : "Search people, skills or competencies"}
                aria-label={isManager ? "Search coachees or skills" : "Search people, skills or competencies"}
                className="rounded-full bg-card pl-8"
              />
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast("9 employees overdue across 4 competencies")}>
              <BellIcon />
            </Button>
            <p className="hidden text-sm text-muted-foreground sm:block">Thursday, May 22</p>
          </header>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" />
    </TooltipProvider>
  )
}

function NavSidebar({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string
  icon: typeof LayoutDashboardIcon
  label: string
  badge?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        isActive={isActive}
        className="h-9 gap-2.5 px-2.5"
        onClick={() => navigate(to)}
      >
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
