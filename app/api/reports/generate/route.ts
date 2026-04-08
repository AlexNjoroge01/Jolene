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
  nextWeekPlan: z.string().optional(),
  projectIds: z.array(z.number().int()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.message)

    const { generatedBy, ...rest } = parsed.data

    const pdfUrl = await generateReport(rest)

    const [report] = await db
      .insert(schema.reports)
      .values({
        type: rest.type,
        title: rest.title,
        periodStart: rest.periodStart,
        periodEnd: rest.periodEnd,
        generatedBy: generatedBy ?? null,
        pdfUrl,
      })
      .returning()

    return ok(report, { status: 201 })
  } catch (err) {
    console.error("[reports/generate] Error:", err)
    return serverError()
  }
}
