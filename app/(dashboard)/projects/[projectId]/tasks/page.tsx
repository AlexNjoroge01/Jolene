import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { PageHeader } from "@/components/layout/PageHeader"
import { db, schema } from "@/lib/db"

export default async function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const projectId = Number((await params).projectId)
  const [tasks, developers] = await Promise.all([
    db.query.tasks.findMany({ where: eq(schema.tasks.projectId, projectId) }),
    db.query.developers.findMany(),
  ])

  async function createTask(formData: FormData) {
    "use server"
    await db.insert(schema.tasks).values({
      projectId,
      title: String(formData.get("title") ?? ""),
      module: String(formData.get("module") ?? ""),
      developerId: Number(formData.get("developerId")) || null,
      status: "todo",
      type: "feature",
    })
    revalidatePath(`/projects/${projectId}/tasks`)
  }

  async function setTaskStatus(formData: FormData) {
    "use server"
    await db
      .update(schema.tasks)
      .set({ status: String(formData.get("status")) as typeof schema.tasks.$inferSelect.status, updatedAt: new Date() })
      .where(eq(schema.tasks.id, Number(formData.get("id"))))
    revalidatePath(`/projects/${projectId}/tasks`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Project Tasks" description="Kanban-friendly task operations." />
      <form action={createTask} className="grid gap-2 rounded border bg-background p-4 md:grid-cols-4">
        <input name="title" required placeholder="Task title" className="rounded border px-3 py-2 text-sm" />
        <input name="module" placeholder="Module" className="rounded border px-3 py-2 text-sm" />
        <select name="developerId" className="rounded border px-3 py-2 text-sm">
          <option value="">Unassigned</option>
          {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Add Task</button>
      </form>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(["todo", "in_progress", "done", "overdue"] as const).map((col) => (
          <div key={col} className="rounded border bg-background p-3">
            <h3 className="mb-2 text-sm font-semibold">{col}</h3>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === col).map((task) => (
                <div key={task.id} className="rounded border p-2 text-sm">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.module || "General"}</p>
                  <form action={setTaskStatus} className="mt-2 flex gap-1">
                    <input type="hidden" name="id" value={task.id} />
                    <select name="status" defaultValue={task.status} className="rounded border px-2 py-1 text-xs">
                      <option value="todo">todo</option>
                      <option value="in_progress">in_progress</option>
                      <option value="done">done</option>
                      <option value="overdue">overdue</option>
                    </select>
                    <button className="rounded border px-2 py-1 text-xs">Update</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
