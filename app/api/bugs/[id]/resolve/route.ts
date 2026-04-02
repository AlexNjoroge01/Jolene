import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid bug id")
    const [updated] = await db
      .update(schema.bugs)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(schema.bugs.id, id))
      .returning()
    if (!updated) return notFound("Bug not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
