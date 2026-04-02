import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid developer id")
    const tasks = await db.query.tasks.findMany({ where: eq(schema.tasks.developerId, id) })
    return ok(tasks)
  } catch {
    return serverError()
  }
}
