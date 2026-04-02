import "dotenv/config"

import { db, schema } from "../lib/db"

const projectNames = [
  "Call Center System",
  "HMIS",
  "HRMS",
  "EDMS",
  "SACCO",
  "KAGRIC Website v2",
  "Business Phone System",
  "ERP",
  "Learning Portal",
  "Payments Hub",
  "Support Desk",
  "Inventory Plus",
  "Fleet Tracking",
]

async function seed() {
  const developers = await db
    .insert(schema.developers)
    .values([
      { name: "John Frontend", email: "john.fe@goip.local", role: "frontend" },
      { name: "Mary Backend", email: "mary.be@goip.local", role: "backend" },
      { name: "Alex Fullstack", email: "alex.fs@goip.local", role: "fullstack" },
      { name: "Head of Technology", email: "hod@goip.local", role: "fullstack" },
    ])
    .onConflictDoNothing()
    .returning()

  const projects = await db
    .insert(schema.projects)
    .values(
      projectNames.map((name, idx) => ({
        name,
        code: name.toLowerCase().replace(/\s+/g, "-"),
        client: `Client ${idx + 1}`,
        status: "active" as const,
      })),
    )
    .onConflictDoNothing()
    .returning()

  const hrms = projects.find((p) => p.name === "HRMS")
  if (hrms) {
    const modules = [
      "Authentication",
      "Employee",
      "Payroll",
      "Leave",
      "Attendance",
      "Recruitment",
      "Performance",
      "Reports",
      "Notifications",
      "Approvals",
      "Settings",
      "Roles",
      "Dashboard",
      "API",
      "Data Import",
      "Audit Trail",
    ]
    const tasks = modules.flatMap((module) =>
      Array.from({ length: 6 }).map((_, idx) => ({
        projectId: hrms.id,
        developerId: developers[idx % Math.max(developers.length, 1)]?.id ?? null,
        title: `${module} task ${idx + 1}`,
        module,
        type: "feature" as const,
        status: "todo" as const,
      })),
    )
    await db.insert(schema.tasks).values(tasks)
  }
}

seed()
  .then(() => {
    console.log("Seed completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
