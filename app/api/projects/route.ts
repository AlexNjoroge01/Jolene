import { desc } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createProjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  client: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "completed"]).default("active"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export async function GET() {
  try {
    const projects = await db.query.projects.findMany({
      orderBy: [desc(schema.projects.createdAt)],
    })
    return ok(projects)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createProjectSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [project] = await db
      .insert(schema.projects)
      .values({
        name: parsed.data.name,
        code: parsed.data.code,
        client: parsed.data.client,
        description: parsed.data.description,
        status: parsed.data.status,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
      })
      .returning()
    return ok(project, { status: 201 })
  } catch {
    return serverError()
  }
}
