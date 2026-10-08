import type { ProficiencyLevel } from "@/domain/types"

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
]

export function proficiencyIndex(level: ProficiencyLevel): number {
  return PROFICIENCY_LEVELS.indexOf(level) + 1
}

export function indexToProficiency(index: number): ProficiencyLevel {
  const clamped = Math.min(4, Math.max(1, Math.round(index)))
  return PROFICIENCY_LEVELS[clamped - 1]
}

export function meetsTarget(assessed: ProficiencyLevel, target: ProficiencyLevel): boolean {
  return proficiencyIndex(assessed) >= proficiencyIndex(target)
}

export function formatProficiencyShort(level: ProficiencyLevel): string {
  return level.charAt(0)
}
