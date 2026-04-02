import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid pull request id")
    const [pr] = await db
      .update(schema.pullRequests)
      .set({ status: "merged", mergedAt: new Date() })
      .where(eq(schema.pullRequests.id, id))
      .returning()
    if (!pr) return notFound("Pull request not found")
    return ok(pr)
  } catch {
    return serverError()
  }
}
