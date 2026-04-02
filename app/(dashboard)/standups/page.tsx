import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"
import Link from "next/link"

import { db, schema } from "@/lib/db"

export default async function StandupsPage() {
  const projects = await db.query.projects.findMany()
  const standups = await db.query.standups.findMany({
    orderBy: (standups, { desc }) => [desc(standups.createdAt)],
  })

  async function createStandup(formData: FormData) {
    "use server"
    await db.insert(schema.standups).values({
      projectId: Number(formData.get("projectId")),
      date: String(formData.get("date")),
      notes: String(formData.get("notes") ?? ""),
    })
    revalidatePath("/standups")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Standups" description="Daily standup hub for facilitation and logged history." />

      <form action={createStandup} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-4">
        <select name="projectId" required className="rounded border px-3 py-2 text-sm">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input name="date" type="date" required className="rounded border px-3 py-2 text-sm" />
        <input name="notes" placeholder="Standup notes" className="rounded border px-3 py-2 text-sm md:col-span-2" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white md:col-span-4">Log Standup</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {projects.map((project) => (
          <Link key={project.id} href={`/standups/${project.id}/today`} className="rounded border px-2 py-1 text-xs">
            Start {project.name} Standup
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Project ID</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2 text-left">Record</th>
            </tr>
          </thead>
          <tbody>
            {standups.map((standup) => (
              <tr key={standup.id} className="border-t">
                <td className="px-3 py-2">{standup.projectId}</td>
                <td className="px-3 py-2">{standup.date}</td>
                <td className="px-3 py-2">{standup.notes || "-"}</td>
                <td className="px-3 py-2">
                  <Link href={`/standups/${standup.id}`} className="underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
