import { PageHeader } from "@/components/layout/PageHeader"
import Link from "next/link"
import { desc } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export default async function ReportsPage() {
  const reports = await db.query.reports.findMany({
    orderBy: [desc(schema.reports.createdAt)],
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Report history and branded PDF exports." />
      <Link href="/reports/new" className="inline-flex rounded bg-black px-3 py-2 text-sm text-white">
        Generate New Report
      </Link>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Period</th>
              <th className="px-3 py-2 text-left">PDF URL</th>
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
                    <a href={report.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
