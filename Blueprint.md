# Jolene — Full System Blueprint
**GoExperience (GOIP) | Head of Technology & Engineering**
**Version:** 1.0 | **Sprint:** April – June 2026

The name of the system is Jolene. 

---

## 1. System Overview

**Jolene is an internal operations platform purpose-built for the Head of Technology and Engineering at GOIP. It centralises team management, project tracking, sprint oversight, standup facilitation, PR review workflow, and branded management reporting — all in one system.

The system replaces fragmented Excel sheets, manual PDF creation, and scattered Slack updates with a structured, role-aware dashboard that generates branded reports on demand.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Full Stack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | NextAuth.js v5 |
| Server State | TanStack React Query |
| Notifications | Sonner (toasts) |
| File Storage | Cloudinary (logo, attachments) |
| PDF Generation | Puppeteer or React-PDF (server action) |
| Scaffold Command | `pnpm dlx shadcn@latest init --preset b5d4Ks41h --template next` |

---

## 3. Core Modules

The system has six top-level modules:

1. **Projects** — All 13+ active projects with status, team, tasks, bugs, blockers, requests
2. **Team** — Developer roster, roles, assignments, capacity
3. **Sprints** — Sprint task boards per project per developer
4. **Standups** — Daily 15-minute standup facilitation and logging
5. **PR Review** — PR queue per project, review status, merge tracking
6. **Reports** — Branded PDF report generation (HOD Monday, Weekly End-of-Week)

---

## 4. Database Schema

### 4.1 `developers`
```
id, name, email, role (frontend | backend | fullstack), avatar_url,
is_active, created_at
```

### 4.2 `projects`
```
id, name, code (slug), client, description, status (active | paused | completed),
start_date, end_date, created_at, updated_at
```

### 4.3 `project_team_members`
```
id, project_id → projects, developer_id → developers,
role_on_project (frontend | backend | lead), assigned_at
```

### 4.4 `sprints`
```
id, project_id → projects, name (e.g. "Sprint 1"), start_date, end_date,
total_tasks, completed_tasks, status (upcoming | active | closed)
```

### 4.5 `tasks`
```
id, sprint_id → sprints, project_id → projects, developer_id → developers,
title, description, module, type (feature | bug | blocker | improvement),
status (todo | in_progress | done | overdue), sprint_day_range,
start_date, end_date, completed_at, created_at, updated_at
```

### 4.6 `bugs`
```
id, project_id → projects, reported_by (developer_id | text), title,
description, severity (low | medium | high | critical),
status (open | in_progress | resolved | wont_fix),
assigned_to → developers, created_at, resolved_at
```

### 4.7 `blockers`
```
id, project_id → projects, raised_by → developers, title, description,
status (active | resolved), raised_at, resolved_at, resolution_note
```

### 4.8 `feature_requests`
```
id, project_id → projects, requested_by (text — could be client or internal),
title, description, priority (low | medium | high),
status (pending | accepted | rejected | in_progress | done), created_at
```

### 4.9 `standups`
```
id, project_id → projects, date (date only), facilitated_by → developers,
notes (text), created_at
```

### 4.10 `standup_entries`
```
id, standup_id → standups, developer_id → developers,
yesterday (text), today (text), blockers (text), mood (1–5 emoji scale)
```

### 4.11 `pull_requests`
```
id, project_id → projects, developer_id → developers,
pr_title, pr_url, branch, base_branch,
status (open | review_requested | changes_requested | approved | merged | closed),
opened_at, merged_at, reviewed_by → developers, review_notes (text)
```

### 4.12 `reports`
```
id, type (hod_monday | weekly_eow | custom), title, generated_by → developers,
period_start, period_end, pdf_url (Cloudinary), created_at
```

### 4.13 `daily_progress_logs`
```
id, project_id → projects, developer_id → developers, log_date,
summary (text), tasks_completed (int), tasks_in_progress (int), created_at
```

---

## 5. Folder Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx
    (dashboard)/
      layout.tsx                  ← Shell: sidebar + topbar
      page.tsx                    ← HOD Command Center (home)
      projects/
        page.tsx                  ← All projects grid
        [projectId]/
          page.tsx                ← Project overview
          tasks/
            page.tsx              ← Sprint task board for this project
          bugs/
            page.tsx
          blockers/
            page.tsx
          feature-requests/
            page.tsx
          prs/
            page.tsx
          team/
            page.tsx
      team/
        page.tsx                  ← Developer roster
        [developerId]/
          page.tsx                ← Developer profile + task load
      sprints/
        page.tsx                  ← Sprint overview across all projects
      standups/
        page.tsx                  ← Today's standup hub
        [standupId]/
          page.tsx                ← Past standup record
      prs/
        page.tsx                  ← Global PR queue
      reports/
        page.tsx                  ← Report history
        new/
          page.tsx                ← Report generator
    api/
      projects/
        route.ts
        [id]/
          route.ts
      tasks/
        route.ts
        [id]/
          route.ts
      bugs/
        route.ts
      blockers/
        route.ts
      feature-requests/
        route.ts
      standups/
        route.ts
      pull-requests/
        route.ts
      reports/
        route.ts
        generate/
          route.ts                ← PDF generation server action
      developers/
        route.ts
  components/
    layout/
      Sidebar.tsx
      Topbar.tsx
      PageHeader.tsx
    projects/
      ProjectCard.tsx
      ProjectStatusBadge.tsx
      ProjectTeamAvatars.tsx
      ProjectOverviewStats.tsx
    tasks/
      TaskBoard.tsx               ← Kanban columns
      TaskCard.tsx
      TaskForm.tsx
      TaskFilters.tsx
      TaskStatusDropdown.tsx
    bugs/
      BugTable.tsx
      BugForm.tsx
      SeverityBadge.tsx
    blockers/
      BlockerCard.tsx
      BlockerForm.tsx
    sprints/
      SprintProgressBar.tsx
      SprintSummaryCard.tsx
    standups/
      StandupFacilitatorView.tsx
      StandupEntryForm.tsx
      StandupLogCard.tsx
    prs/
      PRCard.tsx
      PRStatusBadge.tsx
      PRReviewPanel.tsx
    team/
      DeveloperCard.tsx
      DeveloperTaskLoad.tsx
      DeveloperRoleBadge.tsx
    reports/
      ReportGeneratorForm.tsx
      ReportPreview.tsx           ← Branded HTML preview before PDF export
      ReportHistoryTable.tsx
    ui/                           ← shadcn/ui components live here (auto-generated)
  lib/
    db/
      index.ts                    ← Drizzle client
      schema.ts                   ← All table definitions
    auth/
      index.ts                    ← NextAuth config
    pdf/
      generateReport.ts           ← PDF generation logic (Puppeteer/React-PDF)
      templates/
        HODMondayReport.tsx       ← Branded HOD report template
        WeeklyReport.tsx          ← Branded weekly EOW report template
    queries/
      projects.ts
      tasks.ts
      bugs.ts
      standups.ts
      prs.ts
      reports.ts
    utils/
      dates.ts
      statusColors.ts
      formatters.ts
  hooks/
    useProjects.ts
    useTasks.ts
    useBugs.ts
    useBlockers.ts
    useStandups.ts
    usePRs.ts
    useReports.ts
  constants/
    projectStatuses.ts
    taskStatuses.ts
    bugSeverities.ts
    brandColors.ts                ← Navy #1B2D4F, Lime #6DBE45
```

---

## 6. Page-by-Page Specification

### 6.1 HOD Command Center (`/`) — Home Dashboard

This is the first screen visible after login. It gives the Head of Engineering a complete daily picture.

**Sections:**

**Top Row — Quick Stats (4 stat cards)**
- Total Active Projects (of 13+)
- Tasks Due Today (across all projects)
- Open PRs Awaiting Review
- Active Blockers

**Second Row — Project Health Grid**
A compact grid of all active projects. Each card shows:
- Project name and client
- Team member avatars
- Sprint progress bar (tasks done / total)
- Count badges: bugs open, blockers active, PRs pending
- Status badge: Active / Paused / At Risk

Clicking a project card navigates to `/projects/[projectId]`.

**Third Row — Today's Standups**
A row showing which projects have had standup logged today and which have not. Quick-action button to start a standup for any project.

**Fourth Row — PR Review Queue**
List of open PRs across all projects requiring the HOD's review. Shows developer, project, branch, time open.

**Fifth Row — Recent Activity Feed**
Chronological feed of: tasks marked done, bugs filed, blockers raised, PRs merged, reports generated.

---

### 6.2 Projects List (`/projects`)

Grid of all 13+ projects. Each card shows:
- Project name, client name, status badge
- Team avatars with role icons (FE/BE)
- Sprint progress bar
- Bug / Blocker / PR counts as icon+number badges
- Last activity timestamp

Filter bar at top: filter by status, filter by developer, search by name.

---

### 6.3 Project Overview (`/projects/[projectId]`)

**Tab layout using shadcn Tabs component:**

**Tab 1: Overview**
- Project meta: name, client, start/end, description
- Team section: developer cards with name, role, avatar, task count
- Sprint progress ring chart
- 4 summary badges: Total Tasks / Done / In Progress / Overdue

**Tab 2: Tasks**
Kanban board with 4 columns: To Do | In Progress | Done | Overdue
Each task card shows: title, developer avatar, module tag, sprint day range, status dropdown.
Filters: by developer, by module, by type (feature/bug).
Add Task button opens a slide-over form.

**Tab 3: Bugs**
Table with columns: Title, Severity badge, Assigned To, Status badge, Reported date, Actions (resolve, reassign).
Add Bug button opens inline form.
Severity filter: All / Low / Medium / High / Critical.

**Tab 4: Blockers**
Cards for each active blocker. Shows: title, description, raised by, date raised, resolution status.
Resolve button marks it done with a resolution note.

**Tab 5: Feature Requests**
Table: Title, Requested By, Priority badge, Status badge, Date.
Actions: Accept / Reject / Move to tasks.

**Tab 6: PRs**
Table: PR title, Developer, Branch, Status badge, Date opened, Review status.
Merge / Request Changes / Approve buttons.
Link opens the actual PR URL.

**Tab 7: Daily Logs**
Calendar or table view of daily progress logs per developer per day.
Shows summary text + tasks completed count.

---

### 6.4 Team Roster (`/team`)

Grid of all developers. Each developer card shows:
- Avatar, Name, Role badge (Frontend / Backend / Fullstack)
- Active project count
- Tasks assigned vs completed (mini progress bar)
- Current status indicator

Click navigates to `/team/[developerId]`.

**Developer Profile Page (`/team/[developerId]`)**
- Personal info section
- Active project assignments with role on each
- Task list across all projects (filterable by status)
- PR history
- Capacity indicator (tasks in flight)

---

### 6.5 Sprint Overview (`/sprints`)

Cross-project sprint view. Shows each project's sprint as a row with:
- Project name
- Sprint name and date range
- Progress bar: X of Y tasks done
- Status: Active / Completed / Behind
- Backend tasks progress vs Frontend tasks progress (two mini bars)

Clicking a sprint row expands it or navigates to the project tasks tab.

At the top: a global sprint health card — total tasks across all active sprints, percentage complete, tasks overdue.

---

### 6.6 Standup Hub (`/standups`)

**Today's View:**
List of all active projects. For each, shows:
- Whether standup has been logged today (green tick / red warning)
- Start Standup button (navigates to a timed facilitation view)

**Standup Facilitation View (`/standups/[projectId]/today`)**
This is the 15-minute facilitator screen.

- Timer at top (counts down from 15:00, starts on button click)
- Project name and date prominently shown
- Developer list for the project; for each developer:
  - What did you do yesterday? (text input)
  - What are you doing today? (text input)
  - Any blockers? (text input, with option to auto-create a blocker record)
  - Mood (emoji scale 1–5)
- Save Standup button — logs all entries and marks standup done for the day

**Past Standups:**
Table of all past standups. Filter by project, by date. Click row to view full entry.

---

### 6.7 PR Review Queue (`/prs`)

Global view of all pull requests across all projects.

**Filter tabs:** All | Open | Awaiting Review | Changes Requested | Merged

Table columns: Project, Developer, PR Title (linked), Branch → Base, Status badge, Date opened, Time open (auto-calculated), Actions.

Actions for each PR:
- Approve (turns badge green, sets reviewed_by = current user)
- Request Changes (opens note input)
- Mark Merged (sets status, sets merged_at)
- Open PR (opens pr_url in new tab)

At top: summary row — X PRs open, Y awaiting review, Z merged this week.

---

### 6.8 Reports (`/reports`)

**Report History Table:**
Columns: Report Type, Title, Period, Generated By, Date, PDF link (download).

**Generate New Report (`/reports/new`)**

Step 1: Select report type
- HOD Monday Report
- Weekly End-of-Week Report
- Custom Project Status Report

Step 2: Select period (date range picker)

Step 3: Select projects to include (multi-select checkboxes, default all active)

Step 4: Preview — renders a live HTML preview of the branded report in the page

Step 5: Export to PDF — triggers server action, uploads PDF to Cloudinary, saves record, provides download link

---

## 7. Report Templates Specification

Both report types share the same GoExperience brand standards:

**Brand Rules:**
- Navy `#1B2D4F` — section headings, header bar backgrounds
- Lime Green `#6DBE45` — accent rules, underlines, footer rule, badge fills
- White `#FFFFFF` — page background
- Body text `#333333`
- Logo: goip_logo.png, left-aligned in header

**Page Structure (both templates):**
```
[HEADER]
  Logo (left) | Report Title (right) | Date

[LIME RULE — 2px]

[META TABLE]
  Prepared By | Period | Generated | Classification: Internal

[NAVY SECTION HEADING with lime underline]
  Section content...

[NAVY SECTION HEADING with lime underline]
  Section content...

[LIME RULE]

[FOOTER]
  GoExperience (GOIP) | Confidential | Internal Use Only | Page N of N
```

**HOD Monday Report sections:**
1. Executive Summary (3–4 sentence paragraph auto-generated from project data)
2. Project Portfolio Status Table (all active projects, status, sprint progress %, team size, open bugs, open blockers)
3. Sprint Progress Summary (tasks completed this week vs target)
4. Open Blockers (table: project, title, age in days, raised by)
5. Critical Bugs (severity High/Critical, open)
6. PR Activity (PRs merged last week, PRs open)
7. Team Utilisation (tasks assigned per developer)
8. Upcoming Milestones / Deliverables

**Weekly End-of-Week Report sections:**
1. Week Summary Paragraph
2. Completed Tasks This Week (table per project)
3. In-Progress Tasks Carrying Over
4. Bugs Opened vs Resolved this week (table)
5. Blockers Raised vs Resolved
6. PR Activity Summary
7. Next Week Plan (editable text field in form before export)
8. Developer Notes (optional per-developer free text)

---

## 8. API Route Design

All routes are Next.js App Router Route Handlers under `/api`.

### Projects
```
GET    /api/projects                    — List all projects
POST   /api/projects                    — Create project
GET    /api/projects/[id]               — Project detail with team + stats
PATCH  /api/projects/[id]               — Update project
DELETE /api/projects/[id]               — Soft delete
```

### Tasks
```
GET    /api/tasks?projectId=&sprintId=&developerId=&status=
POST   /api/tasks
PATCH  /api/tasks/[id]
DELETE /api/tasks/[id]
PATCH  /api/tasks/[id]/status           — Quick status update
```

### Bugs
```
GET    /api/bugs?projectId=&severity=&status=
POST   /api/bugs
PATCH  /api/bugs/[id]
PATCH  /api/bugs/[id]/resolve
```

### Blockers
```
GET    /api/blockers?projectId=&status=
POST   /api/blockers
PATCH  /api/blockers/[id]/resolve
```

### Feature Requests
```
GET    /api/feature-requests?projectId=
POST   /api/feature-requests
PATCH  /api/feature-requests/[id]
```

### Standups
```
GET    /api/standups?projectId=&date=
POST   /api/standups                    — Creates standup + entries
GET    /api/standups/[id]
```

### Pull Requests
```
GET    /api/pull-requests?projectId=&status=
POST   /api/pull-requests
PATCH  /api/pull-requests/[id]
PATCH  /api/pull-requests/[id]/merge
PATCH  /api/pull-requests/[id]/review
```

### Developers
```
GET    /api/developers
POST   /api/developers
PATCH  /api/developers/[id]
GET    /api/developers/[id]/tasks       — Tasks across all projects
```

### Reports
```
GET    /api/reports
POST   /api/reports/generate            — Triggers PDF gen, saves to Cloudinary
GET    /api/reports/[id]/download       — Redirect to Cloudinary PDF URL
```

---

## 9. Key UI Component Decisions

### Status Badges (shadcn Badge + custom variants)
Define a `statusColors.ts` util mapping all status strings to tailwind color classes. Used everywhere badges appear — tasks, bugs, PRs, projects.

### Task Board (shadcn + Framer Motion)
Kanban columns rendered with Framer Motion `AnimatePresence` for card enter/exit. Drag-and-drop is a future enhancement — for now, status updates via dropdown on the card.

### Slide-over Forms (shadcn Sheet)
All create/edit forms (task, bug, blocker, PR, developer) open as a right-side sheet overlay rather than modals. Keeps the board visible behind the form.

### Accordion (shadcn Accordion)
Used in the sprint overview page to expand/collapse each project's sprint detail without navigation.

### Progress Bars (shadcn Progress)
Sprint progress, developer task load — all use the shadcn Progress component with lime fill color.

### Avatar Groups (shadcn Avatar)
Project team member stacked avatars on project cards. Max 4 shown, rest shown as +N overflow.

### Framer Motion usage
- Page transitions: `initial={{ opacity: 0, y: 12 }}` on all route pages
- Card entrance: staggered children on project grid and team roster
- Standup timer: animated countdown ring
- Report preview: slide-in from right

---

## 10. Authentication

NextAuth.js v5 with credentials provider (email + password).

**Roles:**
- `hod` — full access, can generate reports, merge PRs, manage all
- `developer` — can update own tasks, log standup entries, raise bugs/blockers

The current user (the HOD) will always log in as `hod`. Developer accounts exist so standup entries and task updates can be attributed correctly.

**Session shape:**
```typescript
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'hod' | 'developer',
    developerId: string
  }
}
```

Route protection: middleware checks session and redirects unauthenticated requests to `/login`.

---

## 11. Build Sequence for the AI Agent

This is the recommended implementation order to avoid dependency issues:

**Phase 1 — Foundation**
1. Scaffold with `pnpm dlx shadcn@latest init --preset b5d4Ks41h --template next`
2. Configure Drizzle ORM + PostgreSQL connection
3. Write full schema in `lib/db/schema.ts`
4. Run migrations
5. Configure NextAuth with credentials + session types
6. Build layout shell: Sidebar + Topbar + page wrapper

**Phase 2 — Core Data Layer**
7. Write all Drizzle query functions in `lib/queries/`
8. Build all API route handlers
9. Seed database with: 13 projects, developer roster, sample tasks matching the uploaded XLSX structure

**Phase 3 — Project + Task Module**
10. Projects list page with filter bar
11. Project overview page with tab layout
12. Task kanban board
13. Bug table + form
14. Blocker cards + form
15. Feature requests table

**Phase 4 — Team Module**
16. Developer roster page
17. Developer profile page with task load view

**Phase 5 — Sprint + Standup Module**
18. Sprint overview page (accordion layout)
19. Standup hub with project status row
20. Standup facilitation view with timer
21. Past standups history view

**Phase 6 — PR Review Module**
22. Global PR queue with filter tabs
23. Per-project PR tab (already in project overview)
24. Review actions (approve, request changes, merge)

**Phase 7 — Reports Module**
25. HOD Monday report HTML template (branded)
26. Weekly EOW report HTML template (branded)
27. PDF generation server action using Puppeteer
28. Cloudinary upload of generated PDF
29. Report generator form with preview
30. Report history table with download links

**Phase 8 — Home Dashboard**
31. Quick stat cards (dynamic from DB)
32. Project health grid
33. Today's standup status row
34. Global PR queue preview
35. Recent activity feed

**Phase 9 — Polish**
36. Framer Motion page transitions and card animations
37. Mobile responsive layout
38. Empty states for all tables and boards
39. Error boundaries
40. Loading skeletons (shadcn Skeleton)
41. Toast notifications via Sonner for all mutations

---

## 12. Branding Constants

Define in `constants/brandColors.ts`:

```
NAVY: '#1B2D4F'
LIME: '#6DBE45'
WHITE: '#FFFFFF'
LIGHT_BG: '#F5F7FA'
MID_GRAY: '#D8DEE8'
BODY_TEXT: '#333333'
SECONDARY_TEXT: '#555F70'
```

The Sidebar background uses NAVY. Section headings in reports use NAVY with a 2px LIME bottom border. All primary action buttons use LIME with white text. Status badges for active/done use LIME-toned variants.

---

## 13. Data Seeding for Launch

Pre-seed the database with:

**13 Active Projects:**
Call Center System, HMIS, HRMS, EDMS, SACCO, KAGRIC Website v2, Business Phone System, ERP, and the 5 additional active projects. Each with status, client, and date range.


**Tasks:**
Import the 96-task structure from the uploaded GOIP_UHPMS_HR_Sprint_Tracker_v1.xlsx as the initial task set for the HRMS project — all 16 modules, backend and frontend tasks, defaulting to "To Do" status.

This gives the system real data from day one without requiring manual entry.

---

