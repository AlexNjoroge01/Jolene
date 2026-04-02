import { and, desc, eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  projectId: z.number().int(),
  requestedBy: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
})

export async function GET(request: NextRequest) {
  try {
    const projectId = Number(request.nextUrl.searchParams.get("projectId") ?? 0)
    const filters = []
    if (projectId) filters.push(eq(schema.featureRequests.projectId, projectId))
    const featureRequests = await db.query.featureRequests.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [desc(schema.featureRequests.createdAt)],
    })
    return ok(featureRequests)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [featureRequest] = await db.insert(schema.featureRequests).values(parsed.data).returning()
    return ok(featureRequest, { status: 201 })
  } catch {
    return serverError()
  }
}
