import { PageHeader } from "@/components/layout/PageHeader"
import Link from "next/link"
import { desc, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db, schema } from "@/lib/db"

export default async function ReportsPage() {
  const reports = await db.query.reports.findMany({
    where: isNull(schema.reports.deletedAt),
    orderBy: [desc(schema.reports.createdAt)],
  })

  async function deleteReport(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    await db.update(schema.reports).set({ deletedAt: new Date() }).where(eq(schema.reports.id, id))
    revalidatePath("/reports")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Report history and branded PDF exports." />
      <Link href="/reports/new" className="inline-flex rounded-xl bg-primary hover:bg-primary/90 px-4 py-2 text-sm text-primary-foreground">
        Generate New Report
      </Link>

      <div className="overflow-hidden rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Period</th>
              <th className="px-3 py-2 text-left">PDF</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="px-3 py-2">{report.type}</td>
                <td className="px-3 py-2">{report.title}</td>
                <td className="px-3 py-2">
                  {report.periodStart || "-"} to {report.periodEnd || "-"}
                </td>
                <td className="px-3 py-2">
                  {report.pdfUrl ? (
                    <a href={report.pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2">
                  <form action={deleteReport}>
                    <input type="hidden" name="id" value={report.id} />
                    <button className="rounded-xl border border-destructive/50 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Delete</button>
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
