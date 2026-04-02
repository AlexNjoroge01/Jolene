import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectBugsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const projectId = Number((await params).projectId)
  const bugs = await db.query.bugs.findMany({ where: eq(schema.bugs.projectId, projectId) })

  async function createBug(formData: FormData) {
    "use server"
    await db.insert(schema.bugs).values({
      projectId,
      reportedBy: String(formData.get("reportedBy") ?? "internal"),
      title: String(formData.get("title") ?? ""),
      severity: String(formData.get("severity") ?? "medium") as typeof schema.bugs.$inferSelect.severity,
      status: "open",
    })
    revalidatePath(`/projects/${projectId}/bugs`)
  }

  async function resolveBug(formData: FormData) {
    "use server"
    await db
      .update(schema.bugs)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(schema.bugs.id, Number(formData.get("id"))))
    revalidatePath(`/projects/${projectId}/bugs`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Project Bugs" description="Track and resolve issues." />
      <form action={createBug} className="grid gap-2 rounded border bg-background p-4 md:grid-cols-4">
        <input name="title" required placeholder="Bug title" className="rounded border px-3 py-2 text-sm" />
        <input name="reportedBy" placeholder="Reported by" className="rounded border px-3 py-2 text-sm" />
        <select name="severity" className="rounded border px-3 py-2 text-sm">
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
        </select>
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Log Bug</button>
      </form>
      <div className="overflow-hidden rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40"><tr><th className="px-3 py-2 text-left">Title</th><th className="px-3 py-2 text-left">Severity</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Action</th></tr></thead>
          <tbody>
            {bugs.map((bug) => (
              <tr key={bug.id} className="border-t">
                <td className="px-3 py-2">{bug.title}</td><td className="px-3 py-2">{bug.severity}</td><td className="px-3 py-2">{bug.status}</td>
                <td className="px-3 py-2"><form action={resolveBug}><input type="hidden" name="id" value={bug.id} /><button className="rounded border px-2 py-1 text-xs">Resolve</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
