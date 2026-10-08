import type { PersonaMeta } from "@/domain/types"

export const MANAGER_RECORD_ID = "vikram-shah"

export const PERSONAS: PersonaMeta[] = [
  {
    id: "leader",
    label: "Competency Leader",
    name: "Ananya Rao",
    role: "Competency Leader",
    initials: "AR",
    tint: "oklch(0.86 0.06 55)",
  },
  {
    id: "candidate",
    label: "Candidate",
    name: "Aarav Mehta",
    role: "Candidate",
    initials: "AM",
    tint: "oklch(0.86 0.06 155)",
  },
  {
    id: "manager",
    label: "People Manager",
    name: "Vikram Shah",
    role: "People Manager",
    initials: "VS",
    tint: "oklch(0.84 0.05 300)",
    recordId: "vikram-shah",
  },
  {
    id: "ld",
    label: "L&D Team",
    name: "Priya Deshmukh",
    role: "L&D Team",
    initials: "PD",
    tint: "oklch(0.86 0.05 20)",
  },
]
