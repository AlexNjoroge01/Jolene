import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, notFound, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

const patchSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["frontend", "backend", "fullstack"]).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid developer id")
    const parsed = patchSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)
    const [updated] = await db
      .update(schema.developers)
      .set(parsed.data)
      .where(eq(schema.developers.id, id))
      .returning()
    if (!updated) return notFound("Developer not found")
    return ok(updated)
  } catch {
    return serverError()
  }
}
