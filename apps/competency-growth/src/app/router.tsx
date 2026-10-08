import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { AssessmentLabPage } from "@/screens/assessment-lab"
import { BlueprintPage } from "@/screens/blueprint"
import { CohortReportPage } from "@/screens/cohorts/cohort-report"
import { BenchmarkJourneyPage } from "@/screens/competencies/benchmark-journey-page"
import { CompetenciesPage } from "@/screens/competencies/competencies-page"
import { ContentPage } from "@/screens/content/content-page"
import { OverviewPage } from "@/screens/overview/overview-page"
import { PeoplePage } from "@/screens/people/people-page"
import { ReportCardReviewPage } from "@/screens/people/report-card-review"
import { ReportsPage } from "@/screens/reports/reports-page"
import { TaxonomyMapPage } from "@/screens/taxonomy/taxonomy-map-page"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "competencies", element: <CompetenciesPage /> },
      { path: "competencies/benchmark", element: <BenchmarkJourneyPage /> },
      { path: "people", element: <PeoplePage /> },
      { path: "people/:personId/report-card", element: <ReportCardReviewPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "taxonomy", element: <TaxonomyMapPage /> },
      { path: "content", element: <ContentPage /> },
      { path: "assessment", element: <AssessmentLabPage /> },
      { path: "blueprint", element: <BlueprintPage /> },
      { path: "cohorts/:cohortId", element: <CohortReportPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
