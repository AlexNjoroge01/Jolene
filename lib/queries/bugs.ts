import { desc, eq } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listBugsByProject(projectId: number) {
  return db.query.bugs.findMany({
    where: eq(schema.bugs.projectId, projectId),
    orderBy: [desc(schema.bugs.createdAt)],
  })
}
