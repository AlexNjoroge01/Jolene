import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const resolveSchema = z.object({
  resolutionNote: z.string().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid blocker id")
    const parsed = resolveSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db
      .update(schema.blockers)
      .set({ status: "resolved", resolvedAt: new Date(), resolutionNote: parsed.data.resolutionNote })
      .where(eq(schema.blockers.id, id))
      .returning()
    if (!updated) return notFound("Blocker not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
