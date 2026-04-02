import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  projectId: z.number().int(),
  reportedBy: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assignedTo: z.number().int().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)
    const severity = request.nextUrl.searchParams.get("severity")
    const status = request.nextUrl.searchParams.get("status")
    const filters = []
    if (projectId) filters.push(eq(schema.bugs.projectId, projectId))
    if (severity) filters.push(eq(schema.bugs.severity, severity as typeof schema.bugs.$inferSelect.severity))
    if (status) filters.push(eq(schema.bugs.status, status as typeof schema.bugs.$inferSelect.status))
    const bugs = await db.query.bugs.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [desc(schema.bugs.createdAt)],
    })
    return ok(bugs)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [bug] = await db.insert(schema.bugs).values(parsed.data).returning()
    return ok(bug, { status: 201 })
  } catch {
    return serverError()
  }
}
