import { desc } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  type: z.enum(["hod_monday", "weekly_eow", "custom"]),
  title: z.string().min(1),
  generatedBy: z.number().int().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  pdfUrl: z.string().url().optional(),
})

export async function GET() {
  try {
    const reports = await db.query.reports.findMany({
      orderBy: [desc(schema.reports.createdAt)],
    })
    return ok(reports)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [report] = await db.insert(schema.reports).values(parsed.data).returning()
    return ok(report, { status: 201 })
  } catch {
    return serverError()
  }
}
