import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db } from "@/lib/db"
import { schema } from "@/lib/db"
import { toId } from "@/lib/route"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid standup id")
    const standup = await db.query.standups.findFirst({ where: eq(schema.standups.id, id) })
    if (!standup) return notFound("Standup not found")
    const entries = await db.query.standupEntries.findMany({
      where: eq(schema.standupEntries.standupId, id),
    })
    return ok({ ...standup, entries })
  } catch {
    return serverError()
  }
}
