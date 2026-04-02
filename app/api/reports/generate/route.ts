import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { generateReport } from "@/lib/pdf/generateReport"

const generateSchema = z.object({
  type: z.enum(["hod_monday", "weekly_eow", "custom"]),
  title: z.string().min(1),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  generatedBy: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const parsed = generateSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const pdfUrl = await generateReport(parsed.data)
    const [report] = await db
      .insert(schema.reports)
      .values({ ...parsed.data, pdfUrl })
      .returning()
    return ok(report, { status: 201 })
  } catch {
    return serverError()
  }
}
