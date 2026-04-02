import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const updateSchema = z.object({
  status: z
    .enum(["open", "review_requested", "changes_requested", "approved", "merged", "closed"])
    .optional(),
  reviewNotes: z.string().optional(),
  reviewedBy: z.number().int().optional(),
})

function parseId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params
    const id = parseId(rawId)
    if (!id) return badRequest("Invalid pull request id")

    const parsed = updateSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [result] = await db
      .update(schema.pullRequests)
      .set({
        ...parsed.data,
        mergedAt: parsed.data.status === "merged" ? new Date() : undefined,
      })
      .where(eq(schema.pullRequests.id, id))
      .returning()

    if (!result) return notFound("Pull request not found")
    return ok(result)
  } catch {
    return serverError()
  }
}
