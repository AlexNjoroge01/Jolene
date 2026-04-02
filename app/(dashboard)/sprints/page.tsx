import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"
import { db, schema } from "@/lib/db"

export default async function SprintsPage() {
  const projects = await db.query.projects.findMany()
  const sprints = await db.query.sprints.findMany({
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

  return (
    <div className="space-y-6">
      <PageHeader title="Sprints" description="Cross-project sprint health and task completion trend." />
      <form action={createSprint} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-4">
        <select name="projectId" className="rounded border px-3 py-2 text-sm">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input name="name" placeholder="Sprint name" required className="rounded border px-3 py-2 text-sm" />
        <input name="startDate" type="date" className="rounded border px-3 py-2 text-sm" />
        <input name="endDate" type="date" className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white md:col-span-4">Create Sprint</button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Project ID</th>
              <th className="px-3 py-2 text-left">Sprint</th>
              <th className="px-3 py-2 text-left">Range</th>
              <th className="px-3 py-2 text-left">Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
