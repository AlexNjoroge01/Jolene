import { PageHeader } from "@/components/layout/PageHeader"
import { revalidatePath } from "next/cache"

import { db, schema } from "@/lib/db"

export default function NewReportPage() {
  async function createReport(formData: FormData) {
    "use server"
    await db.insert(schema.reports).values({
      type: String(formData.get("type") ?? "custom") as "hod_monday" | "weekly_eow" | "custom",
      title: String(formData.get("title") ?? ""),
      periodStart: String(formData.get("periodStart") || ""),
      periodEnd: String(formData.get("periodEnd") || ""),
      pdfUrl: String(formData.get("pdfUrl") || ""),
    })
    revalidatePath("/reports")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Generate Report" description="Build HOD and weekly branded reports." />
      <form action={createReport} className="grid gap-2 rounded-lg border bg-background p-4 md:grid-cols-2">
        <select name="type" className="rounded border px-3 py-2 text-sm">
          <option value="hod_monday">HOD Monday Report</option>
          <option value="weekly_eow">Weekly End-of-Week Report</option>
          <option value="custom">Custom Project Status Report</option>
        </select>
        <input name="title" required placeholder="Report title" className="rounded border px-3 py-2 text-sm" />
        <input name="periodStart" type="date" className="rounded border px-3 py-2 text-sm" />
        <input name="periodEnd" type="date" className="rounded border px-3 py-2 text-sm" />
        <input
          name="pdfUrl"
          placeholder="Optional PDF URL"
          className="rounded border px-3 py-2 text-sm md:col-span-2"
        />
        <button className="rounded bg-black px-3 py-2 text-sm text-white md:col-span-2">Create Report</button>
      </form>
    </div>
  )
}
