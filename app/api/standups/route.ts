import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  projectId: z.number().int(),
  facilitatedBy: z.number().int().optional(),
  date: z.string(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)
    const date = request.nextUrl.searchParams.get("date")

    const filters = []
    if (projectId) filters.push(eq(schema.standups.projectId, projectId))
    if (date) filters.push(eq(schema.standups.date, date))

    const standups = await db.query.standups.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: [desc(schema.standups.createdAt)],
    })
    return ok(standups)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [standup] = await db.insert(schema.standups).values(parsed.data).returning()
    return ok(standup, { status: 201 })
  } catch {
    return serverError()
  }
}
