export type Persona = "leader" | "candidate" | "manager" | "ld"

export const personas: {
  id: Persona
  label: string
  name: string
  role: string
  initials: string
  tint: string
}[] = [
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

export const heatmapSkills = [
  "Python",
  "SQL",
  "Data visualization",
  "Statistical analysis",
  "Data storytelling",
]

export const heatmapRoles = [
  "Associate",
  "Sr. Associate",
  "Manager",
  "Sr. Manager",
  "Director",
]

export const heatmap: number[][] = [
  [2, 3, 3, 4, 5],
  [2, 3, 4, 4, 5],
  [1, 2, 3, 4, 3],
  [1, 2, 3, 3, 2],
  [2, 2, 3, 4, 3],
]

export const watchlist = [
  { name: "Meera Iyer", role: "Manager", focus: "Data storytelling", status: "Behind", due: "6 days left" },
  { name: "Neel Kapoor", role: "Director", focus: "Statistical analysis", status: "Behind", due: "Overdue 2 days" },
  { name: "Aarav Mehta", role: "Sr. Associate", focus: "Python", status: "On track", due: "18 days left" },
  { name: "Rohan Kulkarni", role: "Associate", focus: "SQL", status: "On track", due: "24 days left" },
  { name: "Kavya Nair", role: "Sr. Manager", focus: "All skills met", status: "Completed", due: "Closed May 18" },
]

export const planItems = [
  { id: "1", title: "Python foundations", source: "Internal workshop", duration: "3h 20m", status: "Done" as const, progress: 100 },
  { id: "2", title: "Working with pandas", source: "Coursera", duration: "2h 10m", status: "Done" as const, progress: 100 },
  { id: "3", title: "Applied data analysis", source: "Internal lab", duration: "3h 10m", status: "Resume" as const, progress: 60 },
  { id: "4", title: "Statistical modelling", source: "LinkedIn Learning", duration: "2h 40m", status: "Upcoming" as const, progress: 0 },
]

export const team = [
  { initials: "AM", name: "Aarav Mehta", role: "Senior Associate", focus: "Python", progress: 78, status: "On track", tint: "oklch(0.86 0.06 155)" },
  { initials: "MI", name: "Meera Iyer", role: "Manager", focus: "Data storytelling", progress: 46, status: "Behind", tint: "oklch(0.86 0.06 55)" },
  { initials: "RK", name: "Rohan Kulkarni", role: "Associate", focus: "SQL", progress: 84, status: "On track", tint: "oklch(0.84 0.05 230)" },
  { initials: "KN", name: "Kavya Nair", role: "Senior Manager", focus: "All skills met", progress: 100, status: "Completed", tint: "oklch(0.86 0.05 300)" },
  { initials: "NK", name: "Neel Kapoor", role: "Director", focus: "Statistical analysis", progress: 41, status: "Behind", tint: "oklch(0.86 0.04 190)" },
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

export const competencies = [
  { name: "Data Analytics", roles: 5, published: "Benchmark v3", people: 186 },
  { name: "Microsoft", roles: 4, published: "Draft", people: 0 },
  { name: "Application Technology", roles: 5, published: "Benchmark v2", people: 240 },
  { name: "Emerging Technologies", roles: 3, published: "Benchmark v1", people: 64 },
  { name: "Consulting Skills", roles: 4, published: "Benchmark v2", people: 310 },
]
