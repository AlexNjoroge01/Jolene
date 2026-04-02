import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const statusSchema = z.object({
  status: z.enum(["todo", "in_progress", "done", "overdue"]),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid task id")
    const parsed = statusSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db
      .update(schema.tasks)
      .set({
        status: parsed.data.status,
        completedAt: parsed.data.status === "done" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.tasks.id, id))
      .returning()
    if (!updated) return notFound("Task not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
