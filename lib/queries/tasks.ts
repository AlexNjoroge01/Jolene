import { desc, eq } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listTasksByProject(projectId: number) {
  return db.query.tasks.findMany({
    where: eq(schema.tasks.projectId, projectId),
    orderBy: [desc(schema.tasks.createdAt)],
  })
}
