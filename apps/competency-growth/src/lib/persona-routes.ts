import type { Persona } from "@/domain/types"

const LEADER_BUILDER_PREFIXES = ["/taxonomy", "/content", "/assessment", "/blueprint"]

/** Paths each persona may open (sidebar + deep links). */
export function isRouteAllowedForPersona(persona: Persona, pathname: string): boolean {
  if (persona === "manager") {
    if (pathname === "/") return true
    if (pathname.startsWith("/people")) return true
    if (pathname.startsWith("/reports")) return true
    return false
  }
  if (persona === "leader") {
    if (LEADER_BUILDER_PREFIXES.some((p) => pathname.startsWith(p))) return false
    return true
  }
  return true
}
