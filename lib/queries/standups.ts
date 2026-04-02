import { desc } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listStandups() {
  return db.query.standups.findMany({ orderBy: [desc(schema.standups.createdAt)] })
}
