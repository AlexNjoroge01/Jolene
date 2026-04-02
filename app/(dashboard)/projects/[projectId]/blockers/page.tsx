import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectBlockersPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const projectId = Number((await params).projectId)
  const blockers = await db.query.blockers.findMany({ where: eq(schema.blockers.projectId, projectId) })

  async function createBlocker(formData: FormData) {
    "use server"
    await db.insert(schema.blockers).values({
      projectId,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      status: "active",
    })
    revalidatePath(`/projects/${projectId}/blockers`)
  }

  async function resolveBlocker(formData: FormData) {
    "use server"
    await db
      .update(schema.blockers)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(schema.blockers.id, Number(formData.get("id"))))
    revalidatePath(`/projects/${projectId}/blockers`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Project Blockers" description="Active impediments and resolution notes." />
      <form action={createBlocker} className="grid gap-2 rounded border bg-background p-4 md:grid-cols-3">
        <input name="title" required placeholder="Blocker title" className="rounded border px-3 py-2 text-sm" />
        <input name="description" placeholder="Description" className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Raise Blocker</button>
      </form>
      <div className="space-y-3">
        {blockers.map((blocker) => (
          <div key={blocker.id} className="rounded border bg-background p-4">
            <p className="font-medium">{blocker.title}</p>
            <p className="text-sm text-muted-foreground">{blocker.description}</p>
            <p className="mt-1 text-xs">Status: {blocker.status}</p>
            {blocker.status === "active" ? (
              <form action={resolveBlocker} className="mt-2">
                <input type="hidden" name="id" value={blocker.id} />
                <button className="rounded border px-2 py-1 text-xs">Resolve</button>
              </form>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
