import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ developerId: string }>
}) {
  const developerId = Number((await params).developerId)
  const developer = await db.query.developers.findFirst({
    where: eq(schema.developers.id, developerId),
  })
  if (!developer) notFound()

  const [tasks, prs, assignments] = await Promise.all([
    db.query.tasks.findMany({ where: eq(schema.tasks.developerId, developerId) }),
    db.query.pullRequests.findMany({ where: eq(schema.pullRequests.developerId, developerId) }),
    db.query.projectTeamMembers.findMany({
      where: eq(schema.projectTeamMembers.developerId, developerId),
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title={developer.name} description={`${developer.role} • ${developer.email}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">Active Assignments</p><p className="text-xl font-semibold">{assignments.length}</p></div>
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">Tasks in Flight</p><p className="text-xl font-semibold">{tasks.filter((t) => t.status === "in_progress").length}</p></div>
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">PRs</p><p className="text-xl font-semibold">{prs.length}</p></div>
      </div>
    </div>
  )
}
