import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import Link from "next/link"

import { db, schema } from "@/lib/db"

export default async function TeamPage() {
  const developers = await db.query.developers.findMany({
    orderBy: (developers, { desc }) => [desc(developers.createdAt)],
  })

  async function createDeveloper(formData: FormData) {
    "use server"
    await db.insert(schema.developers).values({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "fullstack") as "frontend" | "backend" | "fullstack",
    })
    revalidatePath("/team")
  }

  async function toggleDeveloper(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    const isActive = String(formData.get("isActive")) === "true"
    await db.update(schema.developers).set({ isActive: !isActive }).where(eq(schema.developers.id, id))
    revalidatePath("/team")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Developer roster, capacity, and assignment load." />

      <form action={createDeveloper} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-4">
        <input name="name" placeholder="Full name" required className="rounded border px-3 py-2 text-sm" />
        <input name="email" placeholder="Email" required className="rounded border px-3 py-2 text-sm" />
        <select name="role" className="rounded border px-3 py-2 text-sm">
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="fullstack">Fullstack</option>
        </select>
        <button className="rounded bg-black px-3 py-2 text-sm text-white">Add Developer</button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {developers.map((developer) => (
              <tr key={developer.id} className="border-t">
                <td className="px-3 py-2">
                  <Link href={`/team/${developer.id}`} className="underline">
                    {developer.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{developer.email}</td>
                <td className="px-3 py-2">{developer.role}</td>
                <td className="px-3 py-2">{developer.isActive ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  <form action={toggleDeveloper}>
                    <input type="hidden" name="id" value={developer.id} />
                    <input type="hidden" name="isActive" value={String(developer.isActive)} />
                    <button className="rounded border px-2 py-1 text-xs">
                      {developer.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
