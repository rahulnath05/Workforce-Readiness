# Competency Growth (Aptora Grove)

React + Vite workspace for the Competency Leader journey and full four-persona surface. Design tokens follow **Aptora Grove** (Manrope + DM Sans, evergreen sidebar, teal readiness scale).

## Run locally

Requires **Node 20+** (LTS recommended). On Windows, install from [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS.LTS`, then **open a new terminal** so `node -v` shows v20+.

If `npm run dev` fails with `styleText` or `Cannot find native binding` (@tailwindcss/oxide), you are still on an old Node — upgrade and run:

```bash
cd apps/competency-growth
rm -r node_modules package-lock.json   # or Remove-Item on PowerShell
npm install
npm run dev
```

Open `http://127.0.0.1:4180`.

## Leader flows (MVP)

- Taxonomy **scope switcher** (practice roll-up vs competency leaf) with dual journey strips
- **Per-role** benchmark publish wizard and version history
- **Readiness** heatmap with drill-down to People
- Cohort CRUD, leads, and `/cohorts/:id` report pack
- Report card **review** at `/people/:id/report-card`
- Scoped validation (leader owned competencies; L&D org-wide)

Functional reference: `L&DMockup` HTML prototype.
