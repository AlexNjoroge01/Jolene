import { PageHeader } from "@/components/layout/PageHeader"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { projects, tasks, pullRequests, blockers, sprints, developers } from "@/lib/db/schema"
import { TasksBreakdownChart } from "@/components/dashboard/tasks-breakdown-chart"
import { DeveloperWorkloadChart } from "@/components/dashboard/developer-workload-chart"
import { ProjectsProgressChart } from "@/components/dashboard/project-progress-chart"
import { SprintsProgressChart } from "@/components/dashboard/sprints-progress-chart"

export default async function DashboardPage() {
  const [
    activeProjects, 
    tasksDueToday, 
    reviewQueue, 
    activeBlockersList, 
    allTasks,
    activeDevelopers,
    activeSprints
  ] = await Promise.all([
    db.query.projects.findMany({ where: eq(projects.status, "active") }),
    db.query.tasks.findMany({ where: eq(tasks.status, "overdue") }),
    db.query.pullRequests.findMany({ where: eq(pullRequests.status, "review_requested") }),
    db.query.blockers.findMany({ where: eq(blockers.status, "active") }),
    db.query.tasks.findMany(),
    db.query.developers.findMany({ where: eq(developers.isActive, true) }),
    db.query.sprints.findMany({ where: eq(sprints.status, "active") }),
  ])

  const stats = [
    { label: "Total Active Projects", value: activeProjects.length },
    { label: "Tasks Due Today", value: tasksDueToday.length },
    { label: "Open PRs Awaiting Review", value: reviewQueue.length },
    { label: "Active Blockers", value: activeBlockersList.length },
  ]

  // Task Status Distribution
  const tasksBreakdown = [
    { name: "Done", value: allTasks.filter(t => t.status === "done").length },
    { name: "In Progress", value: allTasks.filter(t => t.status === "in_progress").length },
    { name: "To Do", value: allTasks.filter(t => t.status === "todo").length },
    { name: "Overdue", value: allTasks.filter(t => t.status === "overdue").length },
  ].filter(t => t.value > 0)

  // Developer Workload
  const devWorkloads = activeDevelopers.map(dev => {
    return {
      name: dev.name.split(" ")[0], // Use first name for chart brevity
      tasks: allTasks.filter(t => t.developerId === dev.id && t.status !== "done").length,
    }
  }).sort((a, b) => b.tasks - a.tasks)

  // Projects Progress
  const projectProgress = activeProjects.map(proj => {
    const projTasks = allTasks.filter(t => t.projectId === proj.id)
    const completed = projTasks.filter(t => t.status === "done").length
    return {
      name: proj.name,
      completed,
      remaining: projTasks.length - completed,
    }
  })

  // Sprint Velocity
  const sprintData = activeSprints.map(sprint => ({
    name: sprint.name,
    totalTasks: sprint.totalTasks,
    completedTasks: sprint.completedTasks,
  }))

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Command Center"
        description="Daily overview across projects, sprints, development workload, and tasks."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-background p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DeveloperWorkloadChart data={devWorkloads} />
        <TasksBreakdownChart data={tasksBreakdown} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectsProgressChart data={projectProgress} />
        <SprintsProgressChart data={sprintData} />
      </div>
    </div>
  )
}
