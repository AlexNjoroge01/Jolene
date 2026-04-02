import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectFeatureRequestsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const projectId = Number((await params).projectId)
  const items = await db.query.featureRequests.findMany({
    where: eq(schema.featureRequests.projectId, projectId),
  })

  async function createRequest(formData: FormData) {
    "use server"
    await db.insert(schema.featureRequests).values({
      projectId,
      requestedBy: String(formData.get("requestedBy") ?? "client"),
      title: String(formData.get("title") ?? ""),
      priority: String(formData.get("priority") ?? "medium") as typeof schema.featureRequests.$inferSelect.priority,
      status: "pending",
    })
    revalidatePath(`/projects/${projectId}/feature-requests`)
  }

  async function setStatus(formData: FormData) {
    "use server"
    await db
      .update(schema.featureRequests)
      .set({ status: String(formData.get("status")) as typeof schema.featureRequests.$inferSelect.status })
      .where(eq(schema.featureRequests.id, Number(formData.get("id"))))
    revalidatePath(`/projects/${projectId}/feature-requests`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Feature Requests" description="Client/internal enhancement pipeline." />
      <form action={createRequest} className="grid gap-2 rounded border bg-background p-4 md:grid-cols-4">
        <input name="title" required placeholder="Title" className="rounded border px-3 py-2 text-sm" />
        <input name="requestedBy" placeholder="Requested by" className="rounded border px-3 py-2 text-sm" />
        <select name="priority" className="rounded border px-3 py-2 text-sm">
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
        </select>
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Add Request</button>
      </form>
      <div className="overflow-hidden rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Priority</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.title}</td><td className="px-3 py-2">{item.priority}</td><td className="px-3 py-2">{item.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {(["accepted", "rejected", "in_progress", "done"] as const).map((status) => (
                      <form key={status} action={setStatus}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="rounded border px-2 py-1 text-xs">{status}</button>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
