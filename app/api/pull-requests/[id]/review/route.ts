import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const reviewSchema = z.object({
  status: z.enum(["approved", "changes_requested", "review_requested"]),
  reviewNotes: z.string().optional(),
  reviewedBy: z.number().int().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid pull request id")
    const parsed = reviewSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [pr] = await db
      .update(schema.pullRequests)
      .set(parsed.data)
      .where(eq(schema.pullRequests.id, id))
      .returning()
    if (!pr) return notFound("Pull request not found")
    return ok(pr)
  } catch {
    return serverError()
  }
}
