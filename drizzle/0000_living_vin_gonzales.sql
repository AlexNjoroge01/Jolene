CREATE TYPE "public"."blocker_status" AS ENUM('active', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."bug_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."bug_status" AS ENUM('open', 'in_progress', 'resolved', 'wont_fix');--> statement-breakpoint
CREATE TYPE "public"."developer_role" AS ENUM('frontend', 'backend', 'fullstack');--> statement-breakpoint
CREATE TYPE "public"."feature_request_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."feature_request_status" AS ENUM('pending', 'accepted', 'rejected', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('frontend', 'backend', 'lead');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."pull_request_status" AS ENUM('open', 'review_requested', 'changes_requested', 'approved', 'merged', 'closed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('hod_monday', 'weekly_eow', 'custom');--> statement-breakpoint
CREATE TYPE "public"."sprint_status" AS ENUM('upcoming', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('feature', 'bug', 'blocker', 'improvement');--> statement-breakpoint
CREATE TABLE "blockers" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"raised_by" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "blocker_status" DEFAULT 'active' NOT NULL,
	"raised_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolution_note" text
);
--> statement-breakpoint
CREATE TABLE "bugs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"reported_by" varchar(180) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"severity" "bug_severity" DEFAULT 'medium' NOT NULL,
	"status" "bug_status" DEFAULT 'open' NOT NULL,
	"assigned_to" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_progress_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"developer_id" integer NOT NULL,
	"log_date" date NOT NULL,
	"summary" text,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"tasks_in_progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(180) NOT NULL,
	"role" "developer_role" NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "developers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"requested_by" varchar(180) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "feature_request_priority" DEFAULT 'medium' NOT NULL,
	"status" "feature_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"developer_id" integer NOT NULL,
	"role_on_project" "project_member_role" NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(180) NOT NULL,
	"code" varchar(80) NOT NULL,
	"client" varchar(180) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"developer_id" integer,
	"pr_title" varchar(255) NOT NULL,
	"pr_url" text NOT NULL,
	"branch" varchar(120) NOT NULL,
	"base_branch" varchar(120) NOT NULL,
	"status" "pull_request_status" DEFAULT 'open' NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"merged_at" timestamp with time zone,
	"reviewed_by" integer,
	"review_notes" text
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "report_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"generated_by" integer,
	"period_start" date,
	"period_end" date,
	"pdf_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"start_date" date,
	"end_date" date,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"status" "sprint_status" DEFAULT 'upcoming' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "standup_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"standup_id" integer NOT NULL,
	"developer_id" integer NOT NULL,
	"yesterday" text,
	"today" text,
	"blockers" text,
	"mood" integer
);
--> statement-breakpoint
CREATE TABLE "standups" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"date" date NOT NULL,
	"facilitated_by" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"sprint_id" integer,
	"project_id" integer NOT NULL,
	"developer_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"module" varchar(160),
	"type" "task_type" DEFAULT 'feature' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"sprint_day_range" varchar(80),
	"start_date" date,
	"end_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockers" ADD CONSTRAINT "blockers_raised_by_developers_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_assigned_to_developers_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress_logs" ADD CONSTRAINT "daily_progress_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress_logs" ADD CONSTRAINT "daily_progress_logs_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_reviewed_by_developers_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_developers_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standup_entries" ADD CONSTRAINT "standup_entries_standup_id_standups_id_fk" FOREIGN KEY ("standup_id") REFERENCES "public"."standups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standup_entries" ADD CONSTRAINT "standup_entries_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standups" ADD CONSTRAINT "standups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standups" ADD CONSTRAINT "standups_facilitated_by_developers_id_fk" FOREIGN KEY ("facilitated_by") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE set null ON UPDATE no action;