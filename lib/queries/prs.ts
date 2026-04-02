import { desc } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listPullRequests() {
  return db.query.pullRequests.findMany({ orderBy: [desc(schema.pullRequests.openedAt)] })
}
