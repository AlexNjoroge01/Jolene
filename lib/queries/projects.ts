import { desc, eq } from "drizzle-orm"

import { db, schema } from "@/lib/db"

export function listProjects() {
  return db.query.projects.findMany({ orderBy: [desc(schema.projects.createdAt)] })
}

export function getProject(projectId: number) {
  return db.query.projects.findFirst({ where: eq(schema.projects.id, projectId) })
}
