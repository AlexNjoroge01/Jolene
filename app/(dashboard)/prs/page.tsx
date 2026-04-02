import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export default async function PullRequestsPage() {
  const projects = await db.query.projects.findMany()
  const developers = await db.query.developers.findMany()
  const pullRequests = await db.query.pullRequests.findMany({
    orderBy: (pullRequests, { desc }) => [desc(pullRequests.openedAt)],
  })

  async function createPullRequest(formData: FormData) {
    "use server"
    await db.insert(schema.pullRequests).values({
      projectId: Number(formData.get("projectId")),
      developerId: Number(formData.get("developerId")),
      prTitle: String(formData.get("prTitle") ?? ""),
      prUrl: String(formData.get("prUrl") ?? ""),
      branch: String(formData.get("branch") ?? ""),
      baseBranch: String(formData.get("baseBranch") ?? "master"),
      status: "open",
    })
    revalidatePath("/prs")
  }

  async function updatePrStatus(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    const status = String(formData.get("status")) as
      | "approved"
      | "changes_requested"
      | "merged"
      | "review_requested"
    await db
      .update(schema.pullRequests)
      .set({
        status,
        mergedAt: status === "merged" ? new Date() : undefined,
      })
      .where(eq(schema.pullRequests.id, id))
    revalidatePath("/prs")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="PR Review Queue" description="Global pull request workflow and actions." />

      <form action={createPullRequest} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-3">
        <select name="projectId" required className="rounded border px-3 py-2 text-sm">
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select name="developerId" required className="rounded border px-3 py-2 text-sm">
          {developers.map((developer) => (
            <option key={developer.id} value={developer.id}>
              {developer.name}
            </option>
          ))}
        </select>
        <input name="prTitle" placeholder="PR title" required className="rounded border px-3 py-2 text-sm" />
        <input name="prUrl" placeholder="PR URL" required className="rounded border px-3 py-2 text-sm" />
        <input name="branch" placeholder="Branch" required className="rounded border px-3 py-2 text-sm" />
        <input name="baseBranch" defaultValue="master" className="rounded border px-3 py-2 text-sm" />
        <button className="rounded bg-black px-3 py-2 text-sm text-white md:col-span-3">Create PR</button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Branch</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pullRequests.map((pr) => (
              <tr key={pr.id} className="border-t">
                <td className="px-3 py-2">{pr.prTitle}</td>
                <td className="px-3 py-2">
                  {pr.branch} {"->"} {pr.baseBranch}
                </td>
                <td className="px-3 py-2">{pr.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <form action={updatePrStatus}>
                      <input type="hidden" name="id" value={pr.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="rounded border px-2 py-1 text-xs">Approve</button>
                    </form>
                    <form action={updatePrStatus}>
                      <input type="hidden" name="id" value={pr.id} />
                      <input type="hidden" name="status" value="changes_requested" />
                      <button className="rounded border px-2 py-1 text-xs">Request Changes</button>
                    </form>
                    <form action={updatePrStatus}>
                      <input type="hidden" name="id" value={pr.id} />
                      <input type="hidden" name="status" value="merged" />
                      <button className="rounded border px-2 py-1 text-xs">Mark Merged</button>
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
