import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  projectId: z.number().int(),
  raisedBy: z.number().int().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)
    const status = request.nextUrl.searchParams.get("status")
    const filters = []
    if (projectId) filters.push(eq(schema.blockers.projectId, projectId))
    if (status) filters.push(eq(schema.blockers.status, status as typeof schema.blockers.$inferSelect.status))
    const blockers = await db.query.blockers.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [desc(schema.blockers.raisedAt)],
    })
    return ok(blockers)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [blocker] = await db.insert(schema.blockers).values(parsed.data).returning()
    return ok(blocker, { status: 201 })
  } catch {
    return serverError()
  }
}
