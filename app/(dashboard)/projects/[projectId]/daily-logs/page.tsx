import { eq } from "drizzle-orm"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectDailyLogsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const projectId = Number((await params).projectId)
  const logs = await db.query.dailyProgressLogs.findMany({
    where: eq(schema.dailyProgressLogs.projectId, projectId),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Logs" description="Developer progress log history." />
      <div className="overflow-hidden rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Developer</th><th className="px-3 py-2 text-left">Summary</th><th className="px-3 py-2 text-left">Done / In Progress</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-3 py-2">{log.logDate}</td>
                <td className="px-3 py-2">{log.developerId}</td>
                <td className="px-3 py-2">{log.summary || "-"}</td>
                <td className="px-3 py-2">{log.tasksCompleted} / {log.tasksInProgress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
