# Workforce Readiness — seed data

All demo / replaceable content for the app lives here. UI and domain logic import from `@/data` (or a specific subfolder). Legacy `@/fixtures/*` paths re-export the same modules.

## Layout

| Path | Powers in the UI |
|------|------------------|
| **taxonomy/** | Org scope tree, per-competency **skill** taxonomy (benchmark wizard picker, validation, heatmaps) |
| **workforce/designation-matrix.ts** | Designation levels + **job profiles** (Competencies table rows, cohort naming, heatmap axes) |
| **workforce/benchmark-templates.ts** | Default skill targets per profile, audience/headcount, published benchmark skill matrix |
| **workforce/competencies.ts** | Competency catalogue + **initial published benchmark versions** (`SEED_PUBLISHED_PROFILES`) |
| **workforce/cohorts.ts** | **One cohort per job profile** — leads, members rollup on Competencies / Cohorts |
| **workforce/people.ts** | Learner roster, skills, readiness % driving table metrics |
| **workforce/reports.ts** | Report cards + saved report list |
| **org/personas.ts** | Sidebar persona switcher (Leader, Manager, L&D, Candidate) |
| **demo/overview-panels.ts** | L&D / Manager / Candidate overview widgets (not the core workforce tables) |

## Competencies page tables

The job-profile grids (benchmark status, cohort lead, members, readiness) are computed from:

1. `designation-matrix.ts` → profile list by designation  
2. `competencies.ts` → which profiles have a published benchmark  
3. `cohorts.ts` + `people.ts` → members, leads, readiness %

To change table content, edit those four files (and `benchmark-templates.ts` if skill targets or headcounts should change).

## Skill taxonomy

See `taxonomy/skill-trees/<CODE>.ts` and `taxonomy/skill-trees/index.ts`.

## Swapping a full dataset

1. Replace files under `workforce/` (keep exported names and types from `@/domain/types`).  
2. Adjust `taxonomy/` if competency codes or skills change.  
3. Run `npm run typecheck` in `apps/competency-growth`.

No component changes required if shapes stay the same.
