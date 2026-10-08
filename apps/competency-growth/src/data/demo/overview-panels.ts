export type TeamStatus = "On track" | "Behind" | "Completed"
export type SkillProgress = "Met" | "Learning" | "Assessed" | "Not started"

export const planItems = [
  { id: "1", title: "Python foundations", source: "Internal workshop", duration: "3h 20m", status: "Done" as const, progress: 100 },
  { id: "2", title: "Working with pandas", source: "Coursera", duration: "2h 10m", status: "Done" as const, progress: 100 },
  { id: "3", title: "Applied data analysis", source: "Internal lab", duration: "3h 10m", status: "Resume" as const, progress: 60 },
  { id: "4", title: "Statistical modelling", source: "LinkedIn Learning", duration: "2h 40m", status: "Upcoming" as const, progress: 0 },
]

export const team = [
  { initials: "AM", name: "Aarav Mehta", role: "Senior Associate", focus: "Python", progress: 78, status: "On track" as TeamStatus, tint: "oklch(0.86 0.06 155)" },
  { initials: "MI", name: "Meera Iyer", role: "Manager", focus: "Data storytelling", progress: 46, status: "Behind" as TeamStatus, tint: "oklch(0.86 0.06 55)" },
  { initials: "RK", name: "Rohan Kulkarni", role: "Associate", focus: "SQL", progress: 84, status: "On track" as TeamStatus, tint: "oklch(0.84 0.05 230)" },
  { initials: "KN", name: "Kavya Nair", role: "Senior Manager", focus: "All skills met", progress: 100, status: "Completed" as TeamStatus, tint: "oklch(0.86 0.05 300)" },
  { initials: "NK", name: "Neel Kapoor", role: "Director", focus: "Statistical analysis", progress: 41, status: "Behind" as TeamStatus, tint: "oklch(0.86 0.04 190)" },
]

export const contentHealth = [
  { resource: "Advanced SQL optimisation", skill: "SQL", source: "Internal SCORM", health: "Healthy", updated: "Validated May 2" },
  { resource: "Python for data analysis", skill: "Python", source: "Coursera URL", health: "Review", updated: "Validated May 9" },
  { resource: "Executive data storytelling", skill: "Storytelling", source: "LinkedIn LTI", health: "Outdated", updated: "Validated May 11" },
  { resource: "Statistics essentials", skill: "Statistics", source: "Internal SCORM", health: "Broken", updated: "Validated May 14" },
  { resource: "Power BI client reporting", skill: "Data visualization", source: "Internal LTI", health: "Healthy", updated: "Validated May 16" },
]

export const bottlenecks = [
  { skill: "Statistical analysis", learners: "1,281 learners", rate: 48 },
  { skill: "Data storytelling", learners: "986 learners", rate: 55 },
  { skill: "Python", learners: "1,142 learners", rate: 63 },
  { skill: "Data visualization", learners: "864 learners", rate: 71 },
]

export const CONTENT_LIBRARY = [
  { title: "Python for Data Analysis", skill: "Python", provider: "Coursera", type: "URL", health: "Healthy", learners: 1542 },
  { title: "Advanced SQL Optimisation", skill: "SQL", provider: "Internal Academy", type: "SCORM", health: "Healthy", learners: 1204 },
  { title: "Executive Data Storytelling", skill: "Data storytelling", provider: "LinkedIn Learning", type: "LTI", health: "Review", learners: 986 },
]
