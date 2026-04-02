import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  module: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done", "overdue"]).optional(),
  developerId: z.number().int().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid task id")
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db
      .update(schema.tasks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.tasks.id, id))
      .returning()
    if (!updated) return notFound("Task not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid task id")
    const [deleted] = await db.delete(schema.tasks).where(eq(schema.tasks.id, id)).returning()
    if (!deleted) return notFound("Task not found")
    return ok(deleted)
  } catch {
    return serverError()
  }
}
