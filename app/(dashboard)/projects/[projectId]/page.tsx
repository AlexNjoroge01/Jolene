import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const projectId = Number((await params).projectId)
  const project = await db.query.projects.findFirst({ where: eq(schema.projects.id, projectId) })
  if (!project) notFound()

  const [tasks, bugs, blockers, prs] = await Promise.all([
    db.query.tasks.findMany({ where: eq(schema.tasks.projectId, projectId) }),
    db.query.bugs.findMany({ where: eq(schema.bugs.projectId, projectId) }),
    db.query.blockers.findMany({ where: eq(schema.blockers.projectId, projectId) }),
    db.query.pullRequests.findMany({ where: eq(schema.pullRequests.projectId, projectId) }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title={project.name} description={`${project.client} • ${project.status}`} />
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={`/projects/${projectId}/tasks`} className="rounded border px-3 py-1">Tasks</Link>
        <Link href={`/projects/${projectId}/bugs`} className="rounded border px-3 py-1">Bugs</Link>
        <Link href={`/projects/${projectId}/blockers`} className="rounded border px-3 py-1">Blockers</Link>
        <Link href={`/projects/${projectId}/feature-requests`} className="rounded border px-3 py-1">Feature Requests</Link>
        <Link href={`/projects/${projectId}/prs`} className="rounded border px-3 py-1">PRs</Link>
        <Link href={`/projects/${projectId}/team`} className="rounded border px-3 py-1">Team</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">Tasks</p><p className="text-xl font-semibold">{tasks.length}</p></div>
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">Bugs</p><p className="text-xl font-semibold">{bugs.length}</p></div>
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">Blockers</p><p className="text-xl font-semibold">{blockers.length}</p></div>
        <div className="rounded border bg-background p-4"><p className="text-xs text-muted-foreground">PRs</p><p className="text-xl font-semibold">{prs.length}</p></div>
      </div>
    </div>
  )
}
