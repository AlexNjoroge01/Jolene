import { desc, isNull } from "drizzle-orm"
import { Download, FileBarChart2, FileText, Layers, Plus } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { db, schema } from "@/lib/db"

const TYPE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  hod_monday: {
    label: "HOD Activity Log",
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "text-[#1B2D4F]",
    bg: "bg-[#1B2D4F]/10",
  },
  weekly_eow: {
    label: "Weekly Report",
    icon: <FileBarChart2 className="h-3.5 w-3.5" />,
    color: "text-[#6DBE45]",
    bg: "bg-[#6DBE45]/10",
  },
  custom: {
    label: "Custom Report",
    icon: <Layers className="h-3.5 w-3.5" />,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
}

function formatDate(d: Date | string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function ReportsPage() {
  const reports = await db.query.reports.findMany({
    where: isNull(schema.reports.deletedAt),
    orderBy: [desc(schema.reports.createdAt)],
  })

  async function deleteReport(formData: FormData) {
    "use server"
    const id = Number(formData.get("id"))
    await db
      .update(schema.reports)
      .set({ deletedAt: new Date() })
      .where(eq(schema.reports.id, id))
    revalidatePath("/reports")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Branded PDF reports for GoExperience (GOIP) — prepared by Alex Njoroge, Head of Technology and Engineering.
          </p>
        </div>
        <Link
          href="/reports/new"
          className="flex items-center gap-2 rounded-xl bg-[#6DBE45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5aad35] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Generate Report
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Reports",
            value: reports.length,
            subLabel: "Generated to date",
            color: "border-[#1B2D4F]/20",
            numColor: "text-[#1B2D4F]",
          },
          {
            label: "HOD Activity Logs",
            value: reports.filter((r) => r.type === "hod_monday").length,
            subLabel: "Monday reports",
            color: "border-[#1B2D4F]/20",
            numColor: "text-[#1B2D4F]",
          },
          {
            label: "Weekly Reports",
            value: reports.filter((r) => r.type === "weekly_eow").length,
            subLabel: "End-of-week reports",
            color: "border-[#6DBE45]/40",
            numColor: "text-[#6DBE45]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border ${stat.color} bg-background p-4`}
          >
            <p className={`text-2xl font-bold ${stat.numColor}`}>{stat.value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.subLabel}</p>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <FileBarChart2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No reports yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Generate your first branded GoExperience PDF report to see it here.
          </p>
          <Link
            href="/reports/new"
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#1B2D4F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2D4F]/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Generate First Report
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Generated
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  PDF
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((report) => {
                const meta = TYPE_META[report.type] ?? TYPE_META.custom
                return (
                  <tr key={report.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[220px] truncate" title={report.title}>
                      {report.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {report.periodStart && report.periodEnd
                        ? `${formatDate(report.periodStart)} → ${formatDate(report.periodEnd)}`
                        : report.periodStart
                          ? `From ${formatDate(report.periodStart)}`
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {report.pdfUrl ? (
                        <a
                          href={report.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B2D4F]/10 px-3 py-1.5 text-xs font-semibold text-[#1B2D4F] hover:bg-[#1B2D4F]/20 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={deleteReport}>
                        <input type="hidden" name="id" value={report.id} />
                        <button className="rounded-lg border border-destructive/40 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
