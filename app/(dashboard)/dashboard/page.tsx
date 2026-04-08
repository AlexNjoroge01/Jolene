import { PageHeader } from "@/components/layout/PageHeader"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

export default async function DashboardPage() {
  const [projects, tasksDueToday, reviewQueue, activeBlockers] = await Promise.all([
    db.query.projects.findMany({ where: (projects) => eq(projects.status, "active") }),
    db.query.tasks.findMany({ where: (tasks) => eq(tasks.status, "overdue") }),
    db.query.pullRequests.findMany({ where: (pullRequests) => eq(pullRequests.status, "review_requested") }),
    db.query.blockers.findMany({ where: (blockers) => eq(blockers.status, "active") }),
  ])

  const stats = [
    { label: "Total Active Projects", value: projects.length },
    { label: "Tasks Due Today", value: tasksDueToday.length },
    { label: "Open PRs Awaiting Review", value: reviewQueue.length },
    { label: "Active Blockers", value: activeBlockers.length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="HOD Command Center"
        description="Daily overview across projects, standups, blockers, and PR review."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-background p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
