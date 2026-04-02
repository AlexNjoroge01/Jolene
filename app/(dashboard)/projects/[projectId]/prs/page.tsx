import { eq } from "drizzle-orm"

import { PageHeader } from "@/components/layout/PageHeader"
import { db } from "@/lib/db"
import { schema } from "@/lib/db"

export default async function ProjectPRsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const projectId = Number((await params).projectId)
  const prs = await db.query.pullRequests.findMany({ where: eq(schema.pullRequests.projectId, projectId) })

  return (
    <div className="space-y-6">
      <PageHeader title="Project PRs" description="PR queue scoped to this project." />
      <div className="overflow-hidden rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
          <tbody>
            {prs.map((pr) => (
              <tr key={pr.id} className="border-t">
                <td className="px-3 py-2">{pr.prTitle}</td>
                <td className="px-3 py-2">{pr.branch} {"->"} {pr.baseBranch}</td>
                <td className="px-3 py-2">{pr.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
