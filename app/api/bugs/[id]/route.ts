import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const patchSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "in_progress", "resolved", "wont_fix"]).optional(),
  assignedTo: z.number().int().nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid bug id")
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db.update(schema.bugs).set(parsed.data).where(eq(schema.bugs.id, id)).returning()
    if (!updated) return notFound("Bug not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
