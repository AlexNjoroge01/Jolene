import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"
import { eq, isNull } from "drizzle-orm"
import { db, schema } from "@/lib/db"

export default async function SprintsPage() {
  const projects = await db.query.projects.findMany({
    where: isNull(schema.projects.deletedAt),
  })
  const sprints = await db.query.sprints.findMany({
    where: isNull(schema.sprints.deletedAt),
    orderBy: (sprints, { desc }) => [desc(sprints.id)],
  })

  async function createSprint(formData: FormData) {
    "use server"
    await db.insert(schema.sprints).values({
      projectId: Number(formData.get("projectId")),
      name: String(formData.get("name") ?? ""),
      startDate: String(formData.get("startDate") || ""),
      endDate: String(formData.get("endDate") || ""),
      status: "active",
    })
    revalidatePath("/sprints")
  }

  async function updateSprintStatus(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    const status = String(formData.get("status")) as "upcoming" | "active" | "closed"
    await db.update(schema.sprints).set({ status }).where(eq(schema.sprints.id, id))
    revalidatePath("/sprints")
  }

  async function deleteSprint(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    await db.update(schema.sprints).set({ deletedAt: new Date() }).where(eq(schema.sprints.id, id))
    revalidatePath("/sprints")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sprints" description="Cross-project sprint health and task completion trend." />
      <form action={createSprint} className="grid gap-2 rounded-xl border bg-background p-4 md:grid-cols-4">
        <select name="projectId" className="rounded-xl border px-3 py-2 text-sm">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="Sprint name" required className="rounded-xl border px-3 py-2 text-sm" />
        <input name="startDate" type="date" className="rounded-xl border px-3 py-2 text-sm" />
        <input name="endDate" type="date" className="rounded-xl border px-3 py-2 text-sm" />
        <button className="rounded-xl bg-primary hover:bg-primary/90 px-3 py-2 text-sm text-primary-foreground md:col-span-4">Create Sprint</button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Project ID</th>
              <th className="px-3 py-2 text-left">Sprint</th>
              <th className="px-3 py-2 text-left">Range</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sprints.map((sprint) => (
              <tr key={sprint.id} className="border-t">
                <td className="px-3 py-2">{sprint.projectId}</td>
                <td className="px-3 py-2">{sprint.name}</td>
                <td className="px-3 py-2">
                  {sprint.startDate || "-"} to {sprint.endDate || "-"}
                </td>
                <td className="px-3 py-2">{sprint.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <form action={updateSprintStatus}>
                      <input type="hidden" name="id" value={sprint.id} />
                      <input type="hidden" name="status" value={sprint.status === "active" ? "closed" : "active"} />
                      <button className="rounded-xl border border-border bg-secondary hover:bg-secondary/80 px-2 py-1 text-xs text-secondary-foreground">
                        {sprint.status === "active" ? "Close" : "Open"}
                      </button>
                    </form>
                    <form action={deleteSprint}>
                      <input type="hidden" name="id" value={sprint.id} />
                      <button className="rounded-xl border border-destructive/50 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Delete</button>
                    </form>
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
