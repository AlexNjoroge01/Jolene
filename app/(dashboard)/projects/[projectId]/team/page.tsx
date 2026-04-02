import { eq } from "drizzle-orm"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectTeamPage({ params }: { params: Promise<{ projectId: string }> }) {
  const projectId = Number((await params).projectId)
  const members = await db.query.projectTeamMembers.findMany({
    where: eq(schema.projectTeamMembers.projectId, projectId),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Project Team" description="Assigned developers and roles." />
      <div className="overflow-hidden rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Developer ID</th>
              <th className="px-3 py-2 text-left">Role on Project</th>
              <th className="px-3 py-2 text-left">Assigned At</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="px-3 py-2">{member.developerId}</td>
                <td className="px-3 py-2">{member.roleOnProject}</td>
                <td className="px-3 py-2">{String(member.assignedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
