import type { ReportCardRecord } from "@/domain/types"

export const INITIAL_REPORT_CARDS: ReportCardRecord[] = [
  { id: "rc-kavya", personId: "kavya", competency: "Product Management", verdict: "Success", summary: "6 of 6 skills met", date: "20 May 2025", reviewStatus: "approved" },
  { id: "rc-arjun", personId: "arjun", competency: "Data Analytics", verdict: "Partial", summary: "4 of 6 skills met", date: "18 May 2025", reviewStatus: "awaiting" },
  { id: "rc-neha", personId: "neha", competency: "Cloud Engineering", verdict: "Success", summary: "8 of 8 skills met", date: "17 May 2025", reviewStatus: "approved" },
  { id: "rc-meera", personId: "meera", competency: "Data Analytics", verdict: "Partial", summary: "3 of 6 skills met", date: "16 May 2025", reviewStatus: "awaiting" },
  { id: "rc-diya", personId: "diya", competency: "Risk & Compliance", verdict: "Fail", summary: "2 of 6 skills met", date: "14 May 2025", reviewStatus: "awaiting" },
  { id: "rc-sanjay", personId: "sanjay", competency: "Data Analytics", verdict: "Success", summary: "5 of 5 skills met", date: "13 May 2025", reviewStatus: "commented", leaderComment: "Strong close on governance narrative." },
]

export type ExportPackFormat = "PDF" | "XLSX" | "CSV"

export interface ExportPack {
  id: string
  label: string
  format: ExportPackFormat
  updated: string
}

export const EXPORT_PACKS: ExportPack[] = [
  { id: "quarterly-outcomes", label: "Quarterly outcomes", format: "PDF", updated: "22 May" },
  { id: "benchmark-effectiveness", label: "Benchmark effectiveness", format: "XLSX", updated: "18 May" },
  { id: "readiness-by-skill", label: "Readiness by skill", format: "XLSX", updated: "09 May" },
  { id: "at-risk-register", label: "At-risk register", format: "CSV", updated: "06 May" },
]

/** @deprecated Use EXPORT_PACKS */
export const SAVED_REPORTS: [string, string][] = EXPORT_PACKS.map((p) => [
  p.label,
  `Updated ${p.updated} · ${p.format}`,
])
