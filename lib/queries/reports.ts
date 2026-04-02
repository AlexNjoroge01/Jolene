import { desc } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listReports() {
  return db.query.reports.findMany({ orderBy: [desc(schema.reports.createdAt)] })
}
