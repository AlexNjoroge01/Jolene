import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  projectId: z.number().int(),
  developerId: z.number().int().optional(),
  prTitle: z.string().min(1),
  prUrl: z.string().url(),
  branch: z.string().min(1),
  baseBranch: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status")
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)

    const filters = []
    if (status) filters.push(eq(schema.pullRequests.status, status as typeof schema.pullRequests.$inferSelect.status))
    if (projectId) filters.push(eq(schema.pullRequests.projectId, projectId))

    const pullRequests = await db.query.pullRequests.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: [desc(schema.pullRequests.openedAt)],
    })
    return ok(pullRequests)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [pullRequest] = await db
      .insert(schema.pullRequests)
      .values({ ...parsed.data, status: "open" })
      .returning()
    return ok(pullRequest, { status: 201 })
  } catch {
    return serverError()
  }
}
