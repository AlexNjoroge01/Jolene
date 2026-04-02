import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const developerRoleEnum = pgEnum("developer_role", [
  "frontend",
  "backend",
  "fullstack",
])
export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "paused",
  "completed",
])
export const projectMemberRoleEnum = pgEnum("project_member_role", [
  "frontend",
  "backend",
  "lead",
])
export const sprintStatusEnum = pgEnum("sprint_status", [
  "upcoming",
  "active",
  "closed",
])
export const taskTypeEnum = pgEnum("task_type", [
  "feature",
  "bug",
  "blocker",
  "improvement",
])
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
  "overdue",
])
export const bugSeverityEnum = pgEnum("bug_severity", [
  "low",
  "medium",
  "high",
  "critical",
])
export const bugStatusEnum = pgEnum("bug_status", [
  "open",
  "in_progress",
  "resolved",
  "wont_fix",
])
export const blockerStatusEnum = pgEnum("blocker_status", ["active", "resolved"])
export const featureRequestPriorityEnum = pgEnum("feature_request_priority", [
  "low",
  "medium",
  "high",
])
export const featureRequestStatusEnum = pgEnum("feature_request_status", [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "done",
])
export const pullRequestStatusEnum = pgEnum("pull_request_status", [
  "open",
  "review_requested",
  "changes_requested",
  "approved",
  "merged",
  "closed",
])
export const reportTypeEnum = pgEnum("report_type", [
  "hod_monday",
  "weekly_eow",
  "custom",
])

export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  role: developerRoleEnum("role").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  client: varchar("client", { length: 180 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").notNull().default("active"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const projectTeamMembers = pgTable("project_team_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  developerId: integer("developer_id")
    .notNull()
    .references(() => developers.id, { onDelete: "cascade" }),
  roleOnProject: projectMemberRoleEnum("role_on_project").notNull(),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
})

export const sprints = pgTable("sprints", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  totalTasks: integer("total_tasks").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
  status: sprintStatusEnum("status").notNull().default("upcoming"),
})

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  sprintId: integer("sprint_id").references(() => sprints.id, { onDelete: "set null" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  developerId: integer("developer_id").references(() => developers.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 160 }),
  type: taskTypeEnum("type").notNull().default("feature"),
  status: taskStatusEnum("status").notNull().default("todo"),
  sprintDayRange: varchar("sprint_day_range", { length: 80 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const bugs = pgTable("bugs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  reportedBy: varchar("reported_by", { length: 180 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: bugSeverityEnum("severity").notNull().default("medium"),
  status: bugStatusEnum("status").notNull().default("open"),
  assignedTo: integer("assigned_to").references(() => developers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
})

export const blockers = pgTable("blockers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  raisedBy: integer("raised_by").references(() => developers.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: blockerStatusEnum("status").notNull().default("active"),
  raisedAt: timestamp("raised_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolutionNote: text("resolution_note"),
})

export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  requestedBy: varchar("requested_by", { length: 180 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: featureRequestPriorityEnum("priority").notNull().default("medium"),
  status: featureRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const standups = pgTable("standups", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  facilitatedBy: integer("facilitated_by").references(() => developers.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const standupEntries = pgTable("standup_entries", {
  id: serial("id").primaryKey(),
  standupId: integer("standup_id")
    .notNull()
    .references(() => standups.id, { onDelete: "cascade" }),
  developerId: integer("developer_id")
    .notNull()
    .references(() => developers.id, { onDelete: "cascade" }),
  yesterday: text("yesterday"),
  today: text("today"),
  blockers: text("blockers"),
  mood: integer("mood"),
})

export const pullRequests = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  developerId: integer("developer_id").references(() => developers.id, {
    onDelete: "set null",
  }),
  prTitle: varchar("pr_title", { length: 255 }).notNull(),
  prUrl: text("pr_url").notNull(),
  branch: varchar("branch", { length: 120 }).notNull(),
  baseBranch: varchar("base_branch", { length: 120 }).notNull(),
  status: pullRequestStatusEnum("status").notNull().default("open"),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
  mergedAt: timestamp("merged_at", { withTimezone: true }),
  reviewedBy: integer("reviewed_by").references(() => developers.id, {
    onDelete: "set null",
  }),
  reviewNotes: text("review_notes"),
})

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: reportTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  generatedBy: integer("generated_by").references(() => developers.id, {
    onDelete: "set null",
  }),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const dailyProgressLogs = pgTable("daily_progress_logs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  developerId: integer("developer_id")
    .notNull()
    .references(() => developers.id, { onDelete: "cascade" }),
  logDate: date("log_date").notNull(),
  summary: text("summary"),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  tasksInProgress: integer("tasks_in_progress").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})
