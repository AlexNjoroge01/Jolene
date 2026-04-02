import { desc } from "drizzle-orm"
import { NextRequest } from "next/server"
import { z } from "zod"

import { badRequest, ok, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["frontend", "backend", "fullstack"]),
  avatarUrl: z.string().url().optional(),
})

export async function GET() {
  try {
    const developers = await db.query.developers.findMany({
      orderBy: [desc(schema.developers.createdAt)],
    })
    return ok(developers)
  } catch {
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(parsed.error.message)

    const [developer] = await db.insert(schema.developers).values(parsed.data).returning()
    return ok(developer, { status: 201 })
  } catch {
    return serverError()
  }
}
