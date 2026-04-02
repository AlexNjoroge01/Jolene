import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  client: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseId(rawId)
    if (!id) return badRequest("Invalid project id")

    const project = await db.query.projects.findFirst({ where: eq(schema.projects.id, id) })
    if (!project) return notFound("Project not found")
    return ok(project)
  } catch {
    return serverError()
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseId(rawId)
    if (!id) return badRequest("Invalid project id")

    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [project] = await db
      .update(schema.projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning()
    if (!project) return notFound("Project not found")
    return ok(project)
  } catch {
    return serverError()
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseId(rawId)
    if (!id) return badRequest("Invalid project id")

    const [project] = await db
      .update(schema.projects)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning()
    if (!project) return notFound("Project not found")
    return ok(project)
  } catch {
    return serverError()
  }
}
