import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function StandupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const standupId = Number((await params).id)
  const standup = await db.query.standups.findFirst({ where: eq(schema.standups.id, standupId) })
  if (!standup) notFound()
  const entries = await db.query.standupEntries.findMany({
    where: eq(schema.standupEntries.standupId, standupId),
  })

  return (
    <div className="space-y-6">
      <PageHeader title={`Standup #${standup.id}`} description={`${standup.date} • Project ${standup.projectId}`} />
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded border bg-background p-4 text-sm">
            <p className="font-medium">Developer #{entry.developerId}</p>
            <p>Yesterday: {entry.yesterday || "-"}</p>
            <p>Today: {entry.today || "-"}</p>
            <p>Blockers: {entry.blockers || "-"}</p>
            <p>Mood: {entry.mood || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
