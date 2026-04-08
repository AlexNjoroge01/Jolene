import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listReports() {
  return db.query.reports.findMany({
    where: isNull(schema.reports.deletedAt),
    orderBy: [desc(schema.reports.createdAt)],
  })
}

export interface ProjectStats {
  id: number
  name: string
  client: string
  status: string
  teamSize: number
  openBugs: number
  criticalBugs: number
  activeBlockers: number
  openPRs: number
  completedTasks: number
  totalTasks: number
  sprintProgress: number
}

export interface BlockerReportData {
  title: string
  description: string | null
  projectName: string
  raisedAt: Date
  ageInDays: number
  raisedByName: string
}

export interface BugReportData {
  title: string
  projectName: string
  severity: string
  assignedToName: string
  createdAt: Date
}

export interface TaskReportData {
  title: string
  projectName: string
  developerName: string
  status: string
  module: string | null
  completedAt: Date | null
}

export interface PRReportData {
  title: string
  projectName: string
  developerName: string
  branch: string
  status: string
  openedAt: Date
}

export interface DeveloperUtilisation {
  name: string
  role: string
  assignedTasks: number
  completedTasks: number
  inProgressTasks: number
}

export interface DailyActivity {
  date: string
  dayName: string
  activities: string[]
}

export interface ReportData {
  projects: ProjectStats[]
  blockers: BlockerReportData[]
  criticalBugs: BugReportData[]
  completedTasks: TaskReportData[]
  inProgressTasks: TaskReportData[]
  allTasks: TaskReportData[]
  prStats: { merged: number; open: number; openPRs: PRReportData[] }
  developerUtilisation: DeveloperUtilisation[]
  dailyActivities: DailyActivity[]
}

export async function getReportData(
  periodStart?: string,
  periodEnd?: string,
  projectIds?: number[],
): Promise<ReportData> {
  const startDate = periodStart ? new Date(periodStart) : undefined
  const endDate = periodEnd ? new Date(periodEnd + "T23:59:59") : undefined

  // Build project filter
  const projectFilter = and(
    isNull(schema.projects.deletedAt),
    projectIds && projectIds.length > 0 ? sql`${schema.projects.id} = ANY(ARRAY[${sql.join(projectIds.map((id) => sql`${id}`), sql`, `)}]::int[])` : undefined,
  )

  // 1. Fetch projects
  const projects = await db.query.projects.findMany({
    where: projectFilter,
    orderBy: [desc(schema.projects.createdAt)],
  })

  const projectIdList = projects.map((p) => p.id)

  if (projectIdList.length === 0) {
    return {
      projects: [],
      blockers: [],
      criticalBugs: [],
      completedTasks: [],
      inProgressTasks: [],
      allTasks: [],
      prStats: { merged: 0, open: 0, openPRs: [] },
      developerUtilisation: [],
      dailyActivities: [],
    }
  }

  const allFilter = sql`${schema.tasks.projectId} = ANY(ARRAY[${sql.join(projectIdList.map((id) => sql`${id}`), sql`, `)}]::int[])`
  const bugFilter = sql`${schema.bugs.projectId} = ANY(ARRAY[${sql.join(projectIdList.map((id) => sql`${id}`), sql`, `)}]::int[])`
  const blockerFilter = sql`${schema.blockers.projectId} = ANY(ARRAY[${sql.join(projectIdList.map((id) => sql`${id}`), sql`, `)}]::int[])`
  const prFilter = sql`${schema.pullRequests.projectId} = ANY(ARRAY[${sql.join(projectIdList.map((id) => sql`${id}`), sql`, `)}]::int[])`
  const memberFilter = sql`${schema.projectTeamMembers.projectId} = ANY(ARRAY[${sql.join(projectIdList.map((id) => sql`${id}`), sql`, `)}]::int[])`

  // 2. Fetch all relevant data in parallel
  const [bugs, blockers, tasks, prs, teamMembers, developers] = await Promise.all([
    db.query.bugs.findMany({ where: bugFilter }),
    db.query.blockers.findMany({ where: blockerFilter }),
    db.query.tasks.findMany({ where: allFilter }),
    db.query.pullRequests.findMany({
      where: and(prFilter, isNull(schema.pullRequests.deletedAt)),
    }),
    db.query.projectTeamMembers.findMany({ where: memberFilter }),
    db.query.developers.findMany({ where: isNull(schema.developers.deletedAt) }),
  ])

  const devMap = new Map(developers.map((d) => [d.id, d]))
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  // 3. Build project stats
  const projectStats: ProjectStats[] = projects.map((project) => {
    const pBugs = bugs.filter((b) => b.projectId === project.id)
    const pBlockers = blockers.filter((b) => b.projectId === project.id && b.status === "active")
    const pPRs = prs.filter((pr) => pr.projectId === project.id && pr.status === "open")
    const pTasks = tasks.filter((t) => t.projectId === project.id)
    const pMembers = teamMembers.filter((m) => m.projectId === project.id)
    const completedTasks = pTasks.filter((t) => t.status === "done").length
    const totalTasks = pTasks.length

    return {
      id: project.id,
      name: project.name,
      client: project.client,
      status: project.status,
      teamSize: pMembers.length,
      openBugs: pBugs.filter((b) => b.status === "open" || b.status === "in_progress").length,
      criticalBugs: pBugs.filter((b) => (b.severity === "critical" || b.severity === "high") && b.status !== "resolved").length,
      activeBlockers: pBlockers.length,
      openPRs: pPRs.length,
      completedTasks,
      totalTasks,
      sprintProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  })

  // 4. Blockers list
  const blockerData: BlockerReportData[] = blockers
    .filter((b) => b.status === "active")
    .map((b) => {
      const project = projectMap.get(b.projectId)
      const raisedByDev = b.raisedBy ? devMap.get(b.raisedBy) : undefined
      const ageInDays = Math.floor((Date.now() - b.raisedAt.getTime()) / (1000 * 60 * 60 * 24))
      return {
        title: b.title,
        description: b.description,
        projectName: project?.name ?? "Unknown",
        raisedAt: b.raisedAt,
        ageInDays,
        raisedByName: raisedByDev?.name ?? "Unassigned",
      }
    })
    .sort((a, b) => b.ageInDays - a.ageInDays)

  // 5. Critical bugs
  const criticalBugData: BugReportData[] = bugs
    .filter((b) => (b.severity === "critical" || b.severity === "high") && b.status !== "resolved")
    .map((b) => {
      const project = projectMap.get(b.projectId)
      const assignedDev = b.assignedTo ? devMap.get(b.assignedTo) : undefined
      return {
        title: b.title,
        projectName: project?.name ?? "Unknown",
        severity: b.severity,
        assignedToName: assignedDev?.name ?? "Unassigned",
        createdAt: b.createdAt,
      }
    })

  // 6. Tasks within period
  const periodTasks = tasks.filter((t) => {
    if (!startDate && !endDate) return true
    if (startDate && t.createdAt < startDate) return false
    if (endDate && t.createdAt > endDate) return false
    return true
  })

  const completedTaskData: TaskReportData[] = periodTasks
    .filter((t) => t.status === "done")
    .map((t) => ({
      title: t.title,
      projectName: projectMap.get(t.projectId)?.name ?? "Unknown",
      developerName: t.developerId ? devMap.get(t.developerId)?.name ?? "Unassigned" : "Unassigned",
      status: t.status,
      module: t.module,
      completedAt: t.completedAt,
    }))

  const inProgressTaskData: TaskReportData[] = periodTasks
    .filter((t) => t.status === "in_progress")
    .map((t) => ({
      title: t.title,
      projectName: projectMap.get(t.projectId)?.name ?? "Unknown",
      developerName: t.developerId ? devMap.get(t.developerId)?.name ?? "Unassigned" : "Unassigned",
      status: t.status,
      module: t.module,
      completedAt: null,
    }))

  // 7. PR stats
  const mergedPRs = prs.filter((pr) => {
    if (pr.status !== "merged") return false
    if (!startDate && !endDate) return true
    if (pr.mergedAt) {
      if (startDate && pr.mergedAt < startDate) return false
      if (endDate && pr.mergedAt > endDate) return false
    }
    return true
  })

  const openPRData: PRReportData[] = prs
    .filter((pr) => pr.status === "open" || pr.status === "review_requested")
    .map((pr) => ({
      title: pr.prTitle,
      projectName: projectMap.get(pr.projectId)?.name ?? "Unknown",
      developerName: pr.developerId ? devMap.get(pr.developerId)?.name ?? "Unassigned" : "Unassigned",
      branch: pr.branch,
      status: pr.status,
      openedAt: pr.openedAt,
    }))

  // 8. Developer utilisation
  const devUtilisation: DeveloperUtilisation[] = developers.map((dev) => {
    const devTasks = tasks.filter((t) => t.developerId === dev.id)
    return {
      name: dev.name,
      role: dev.role,
      assignedTasks: devTasks.length,
      completedTasks: devTasks.filter((t) => t.status === "done").length,
      inProgressTasks: devTasks.filter((t) => t.status === "in_progress").length,
    }
  }).filter((d) => d.assignedTasks > 0)
    .sort((a, b) => b.assignedTasks - a.assignedTasks)

  // 9. Daily activities (based on period)
  const dailyActivities = buildDailyActivities(startDate, endDate, completedTaskData, blockerData)

  return {
    projects: projectStats,
    blockers: blockerData,
    criticalBugs: criticalBugData,
    completedTasks: completedTaskData,
    inProgressTasks: inProgressTaskData,
    allTasks: periodTasks.map((t) => ({
      title: t.title,
      projectName: projectMap.get(t.projectId)?.name ?? "Unknown",
      developerName: t.developerId ? devMap.get(t.developerId)?.name ?? "Unassigned" : "Unassigned",
      status: t.status,
      module: t.module,
      completedAt: t.completedAt,
    })),
    prStats: { merged: mergedPRs.length, open: openPRData.length, openPRs: openPRData },
    developerUtilisation: devUtilisation,
    dailyActivities,
  }
}

function buildDailyActivities(
  startDate?: Date,
  endDate?: Date,
  completedTasks?: TaskReportData[],
  blockers?: BlockerReportData[],
): DailyActivity[] {
  if (!startDate || !endDate) return []

  const days: DailyActivity[] = []
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const current = new Date(startDate)
  while (current <= endDate) {
    const dayName = dayNames[current.getDay()]
    const dateStr = `${current.getDate()} ${months[current.getMonth()]} ${current.getFullYear()}`
    const activities: string[] = []

    // Add completed tasks for this day
    const dayTasks = completedTasks?.filter((t) => {
      if (!t.completedAt) return false
      const d = new Date(t.completedAt)
      return d.toDateString() === current.toDateString()
    }) ?? []

    dayTasks.slice(0, 4).forEach((t) => {
      activities.push(`Completed: ${t.title} (${t.projectName})${t.developerName !== "Unassigned" ? ` — ${t.developerName}` : ""}`)
    })

    // Add blockers raised this day
    const dayBlockers = blockers?.filter((b) => {
      const d = new Date(b.raisedAt)
      return d.toDateString() === current.toDateString()
    }) ?? []

    dayBlockers.forEach((b) => {
      activities.push(`Blocker raised on ${b.projectName}: ${b.title}`)
    })

    if (activities.length === 0) {
      activities.push("Regular engineering work and project progress continued.")
    }

    // Skip weekends if no activities
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      days.push({ date: dateStr, dayName, activities })
    }

    current.setDate(current.getDate() + 1)
  }

  return days
}
