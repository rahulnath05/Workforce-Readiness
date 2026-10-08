import type { SkillTarget, ValidationCheck } from "@/domain/types"
import { TAXONOMY_SKILLS } from "@/fixtures/taxonomy"

export function runBenchmarkChecks(
  competencyCode: string,
  skills: SkillTarget[],
): ValidationCheck[] {
  const tax = TAXONOMY_SKILLS[competencyCode] ?? []
  const checks: ValidationCheck[] = []
  const unknown = skills.filter((s) => !tax.includes(s.name))
  if (unknown.length) {
    checks.push({
      id: "taxonomy",
      level: "error",
      title: "Taxonomy mapping",
      detail: `${unknown.length} skill(s) are not in the ${competencyCode} taxonomy.`,
      waivable: true,
    })
  } else {
    checks.push({
      id: "taxonomy",
      level: "pass",
      title: "Taxonomy mapping",
      detail: `All ${skills.length} skills resolve against the curated taxonomy.`,
    })
  }
  if (skills.length < 3) {
    checks.push({
      id: "matrix-size",
      level: "warn",
      title: "Matrix size",
      detail: "Fewer than three skills — the benchmark may be too narrow.",
    })
  }
  const orphans = skills.filter((s) => s.name === "Prompt engineering")
  if (orphans.length) {
    checks.push({
      id: "content",
      level: "warn",
      title: "Content coverage",
      detail: "Some skills have limited mapped learning content in the library.",
      waivable: true,
    })
  }
  return checks
}

export function blockingErrors(checks: ValidationCheck[], waived: Set<string>): ValidationCheck[] {
  return checks.filter((c) => c.level === "error" && !(c.waivable && waived.has(c.id)))
}
