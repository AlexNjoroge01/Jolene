import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function ProjectsPage() {
  const projects = await db.query.projects.findMany({
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  })

  async function createProject(formData: FormData) {
    "use server"
    await db.insert(schema.projects).values({
      name: String(formData.get("name") ?? ""),
      code: String(formData.get("code") ?? ""),
      client: String(formData.get("client") ?? ""),
      status: "active",
    })
    revalidatePath("/projects")
  }

  async function updateProjectStatus(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    const status = String(formData.get("status")) as "active" | "paused" | "completed"
    await db
      .update(schema.projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
    revalidatePath("/projects")
  }

  async function deleteProject(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    await db.delete(schema.projects).where(eq(schema.projects.id, id))
    revalidatePath("/projects")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Project grid, filters, and portfolio health." />

      <form action={createProject} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-4">
        <input name="name" placeholder="Project name" required className="rounded border px-3 py-2 text-sm" />
        <input name="code" placeholder="Code/slug" required className="rounded border px-3 py-2 text-sm" />
        <input name="client" placeholder="Client" required className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Create Project</button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/projects/${project.id}`} className="underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{project.code}</td>
                <td className="px-3 py-2">{project.client}</td>
                <td className="px-3 py-2">{project.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <form action={updateProjectStatus}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="status" value="active" />
                      <button className="rounded border px-2 py-1 text-xs">Active</button>
                    </form>
                    <form action={updateProjectStatus}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="status" value="paused" />
                      <button className="rounded border px-2 py-1 text-xs">Pause</button>
                    </form>
                    <form action={deleteProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <button className="rounded border px-2 py-1 text-xs text-red-600">Delete</button>
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
