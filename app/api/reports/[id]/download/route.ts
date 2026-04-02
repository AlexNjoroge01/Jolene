import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { badRequest, notFound, serverError } from "@/lib/api"
import { db, schema } from "@/lib/db"
import { toId } from "@/lib/route"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = toId((await params).id)
    if (!id) return badRequest("Invalid report id")
    const report = await db.query.reports.findFirst({ where: eq(schema.reports.id, id) })
    if (!report?.pdfUrl) return notFound("Report PDF URL not found")
    return NextResponse.redirect(report.pdfUrl)
  } catch {
    return serverError()
  }
}
