import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const patchSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "accepted", "rejected", "in_progress", "done"]).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid feature request id")
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db
      .update(schema.featureRequests)
      .set(parsed.data)
      .where(eq(schema.featureRequests.id, id))
      .returning()
    if (!updated) return notFound("Feature request not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
