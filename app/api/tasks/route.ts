import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  sprintId: z.number().int().optional(),
  projectId: z.number().int(),
  developerId: z.number().int().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  module: z.string().optional(),
  type: z.enum(["feature", "bug", "blocker", "improvement"]).default("feature"),
  status: z.enum(["todo", "in_progress", "done", "overdue"]).default("todo"),
  sprintDayRange: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)
    const sprintId = Number(request.nextUrl.searchParams.get("sprintId") ?? 0)
    const developerId = Number(request.nextUrl.searchParams.get("developerId") ?? 0)
    const status = request.nextUrl.searchParams.get("status")
    const filters = []
    if (projectId) filters.push(eq(schema.tasks.projectId, projectId))
    if (sprintId) filters.push(eq(schema.tasks.sprintId, sprintId))
    if (developerId) filters.push(eq(schema.tasks.developerId, developerId))
    if (status) filters.push(eq(schema.tasks.status, status as typeof schema.tasks.$inferSelect.status))
    const tasks = await db.query.tasks.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [desc(schema.tasks.createdAt)],
    })
    return ok(tasks)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [task] = await db.insert(schema.tasks).values(parsed.data).returning()
    return ok(task, { status: 201 })
  } catch {
    return serverError()
  }
}
