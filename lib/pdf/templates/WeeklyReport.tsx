import type { ReportData } from "@/lib/queries/reports"

const NAVY = "#1B2D4F"
const LIME = "#6DBE45"

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

function shortDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
}

function baseStyles() {
  return `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
        background: white;
        font-size: 10.5pt;
        line-height: 1.6;
      }
      .page-header {
        display: flex;
        align-items: center;
        padding: 10px 28px;
      }
      .logo-cell {
        display: flex;
        align-items: center;
        min-width: 130px;
      }
      .logo { height: 44px; object-fit: contain; }
      .header-vline {
        width: 1px;
        height: 40px;
        background: #1B2D4F;
        margin: 0 20px;
        flex-shrink: 0;
      }
      .header-title {
        flex: 1;
        text-align: center;
        color: #1B2D4F;
        font-size: 12pt;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .header-date-label {
        font-size: 9pt;
        color: #333;
        white-space: nowrap;
        min-width: 130px;
        text-align: right;
      }
      .lime-rule { height: 2px; background: #6DBE45; margin: 0; }
      .report-title-block {
        text-align: center;
        padding: 22px 28px 14px;
      }
      .report-title-block h1 {
        font-size: 20pt;
        color: #1B2D4F;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .report-subtitle {
        color: #555F70;
        font-size: 9.5pt;
        margin-top: 4px;
      }
      .report-period-label {
        color: #6DBE45;
        font-size: 10pt;
        font-weight: bold;
        margin-top: 6px;
      }
      .meta-table {
        margin: 12px 28px 16px;
        border-collapse: collapse;
        width: calc(100% - 56px);
      }
      .meta-table td {
        padding: 7px 12px;
        border: 1px solid #D8DEE8;
        font-size: 9.5pt;
        vertical-align: top;
      }
      .meta-table td.label {
        font-weight: bold;
        color: #1B2D4F;
        background: #F5F7FA;
        width: 170px;
      }
      .section { margin: 16px 28px; }
      .section-heading {
        font-size: 12pt;
        font-weight: bold;
        color: #1B2D4F;
        padding-bottom: 5px;
        border-bottom: 2px solid #6DBE45;
        margin-bottom: 12px;
      }
      .summary-para {
        font-size: 10pt;
        line-height: 1.7;
        color: #333;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9pt;
        margin-bottom: 10px;
      }
      .data-table th {
        background: #1B2D4F;
        color: white;
        padding: 7px 10px;
        text-align: left;
        font-size: 8.5pt;
        font-weight: bold;
      }
      .data-table td {
        padding: 6px 10px;
        border-bottom: 1px solid #D8DEE8;
        vertical-align: top;
      }
      .data-table tr:nth-child(even) td { background: #F5F7FA; }
      .badge {
        display: inline-block;
        padding: 1px 7px;
        border-radius: 3px;
        font-size: 8pt;
        font-weight: bold;
      }
      .badge-active { background: #e8f5e0; color: #2e6b10; }
      .badge-paused { background: #fff3cd; color: #856404; }
      .badge-completed { background: #d1ecf1; color: #0c5460; }
      .badge-critical { background: #ffe0e0; color: #b91c1c; }
      .badge-high { background: #fff3e0; color: #c05500; }
      .badge-medium { background: #fffde0; color: #7a6500; }
      .badge-open { background: #e0f0ff; color: #0050aa; }
      .badge-merged { background: #e8f5e0; color: #2e6b10; }
      .progress-wrap { background: #D8DEE8; border-radius: 3px; height: 6px; width: 80px; display: inline-block; vertical-align: middle; }
      .progress-bar { background: #6DBE45; height: 6px; border-radius: 3px; }
      .summary-boxes { display: flex; gap: 10px; margin-bottom: 12px; }
      .summary-box {
        flex: 1;
        border: 1px solid #D8DEE8;
        border-radius: 4px;
        padding: 10px 14px;
        text-align: center;
      }
      .summary-box .box-num { font-size: 20pt; font-weight: bold; color: #1B2D4F; }
      .summary-box .box-label { font-size: 8pt; color: #555F70; margin-top: 2px; }
      .summary-box.lime-box { border-color: #6DBE45; }
      .summary-box.lime-box .box-num { color: #6DBE45; }
      .two-col { display: flex; gap: 14px; }
      .two-col .col { flex: 1; }
      .subheading {
        font-size: 10pt;
        font-weight: bold;
        color: #1B2D4F;
        margin-bottom: 8px;
        margin-top: 12px;
      }
      .empty-note { color: #888; font-style: italic; font-size: 9pt; padding: 8px 0; }
      @page { margin: 14mm 14mm 22mm 14mm; size: A4; }
    </style>
  `
}

export type WeeklyReportInput = {
  title: string
  periodStart?: string
  periodEnd?: string
  nextWeekPlan?: string
  customNotes?: string
  data: ReportData
  logoBase64: string
}

export function renderWeeklyReport(input: WeeklyReportInput): string {
  const { title, periodStart, periodEnd, data, logoBase64, nextWeekPlan, customNotes } = input
  const today = new Date()
  let html: string

  const periodDisplay =
    periodStart && periodEnd
      ? `${shortDate(periodStart)} to ${shortDate(periodEnd)}`
      : shortDate(today)

  const weekLabel = periodEnd ? `W/E ${shortDate(periodEnd)}` : shortDate(today)

  const weekOfLabel =
    periodStart && periodEnd
      ? `Week of ${shortDate(periodStart)} to ${shortDate(periodEnd)}`
      : `Week ending ${shortDate(today)}`

  // Executive summary auto-generated
  const totalCompleted = data.completedTasks.length
  const totalInProgress = data.inProgressTasks.length
  const totalProjects = data.projects.length
  const totalBlockers = data.blockers.length
  const totalBugs = data.criticalBugs.length

  const executiveSummary = `This report covers engineering activities for the period ${periodDisplay}. The Engineering and Technology department managed ${totalProjects} active project${totalProjects !== 1 ? "s" : ""} during this period, completing ${totalCompleted} task${totalCompleted !== 1 ? "s" : ""} with ${totalInProgress} task${totalInProgress !== 1 ? "s" : ""} carrying into the next period. There are currently ${totalBlockers} active blocker${totalBlockers !== 1 ? "s" : ""} and ${totalBugs} high-severity bug${totalBugs !== 1 ? "s" : ""} requiring attention. PR activity recorded ${data.prStats.merged} merged pull request${data.prStats.merged !== 1 ? "s" : ""} with ${data.prStats.open} currently open for review.`

  // Project portfolio rows
  const projectRows = data.projects.map((p) => `
    <tr>
      <td style="font-weight:500;">${p.name}</td>
      <td>${p.client}</td>
      <td><span class="badge badge-${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="progress-wrap"><div class="progress-bar" style="width:${p.sprintProgress}%;"></div></div>
          <span style="font-size:8pt;">${p.sprintProgress}%</span>
        </div>
      </td>
      <td style="text-align:center;">${p.teamSize}</td>
      <td style="text-align:center;">${p.openBugs}</td>
      <td style="text-align:center;">${p.activeBlockers}</td>
      <td style="text-align:center;">${p.openPRs}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="empty-note" style="padding:10px;">No projects found.</td></tr>`

  // Completed tasks rows (group by project)
  const groupedCompleted: Record<string, typeof data.completedTasks> = {}
  data.completedTasks.forEach((t) => {
    if (!groupedCompleted[t.projectName]) groupedCompleted[t.projectName] = []
    groupedCompleted[t.projectName].push(t)
  })

  const completedRows = data.completedTasks.length > 0
    ? data.completedTasks.map((t) => `
        <tr>
          <td style="font-weight:500;">${t.projectName}</td>
          <td>${t.title}</td>
          <td>${t.module ?? "--"}</td>
          <td>${t.developerName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" class="empty-note" style="padding:10px;">No tasks completed in this period.</td></tr>`

  // In-progress rows
  const inProgressRows = data.inProgressTasks.length > 0
    ? data.inProgressTasks.map((t) => `
        <tr>
          <td style="font-weight:500;">${t.projectName}</td>
          <td>${t.title}</td>
          <td>${t.module ?? "--"}</td>
          <td>${t.developerName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" class="empty-note" style="padding:10px;">No in-progress tasks carrying over.</td></tr>`

  // Bug stats
  const openBugsCount = data.projects.reduce((sum, p) => sum + p.openBugs, 0)
  const critBugsCount = data.criticalBugs.length
  const bugRows = data.criticalBugs.length > 0
    ? data.criticalBugs.map((b) => `
        <tr>
          <td style="font-weight:500;">${b.projectName}</td>
          <td>${b.title}</td>
          <td><span class="badge badge-${b.severity}">${b.severity.toUpperCase()}</span></td>
          <td>${b.assignedToName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" class="empty-note" style="padding:10px;">No critical/high bugs open. ✓</td></tr>`

  // Blockers rows
  const blockerRows = data.blockers.length > 0
    ? data.blockers.map((b) => `
        <tr>
          <td style="font-weight:500;">${b.projectName}</td>
          <td>${b.title}</td>
          <td style="text-align:center;">${b.ageInDays}d</td>
          <td>${b.raisedByName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" class="empty-note" style="padding:10px;">No active blockers. ✓</td></tr>`

  // PR rows
  const prRows = data.prStats.openPRs.length > 0
    ? data.prStats.openPRs.map((pr) => `
        <tr>
          <td>${pr.projectName}</td>
          <td>${pr.title}</td>
          <td>${pr.developerName}</td>
          <td style="font-size:8pt;font-family:monospace;">${pr.branch}</td>
          <td><span class="badge badge-open">${pr.status.replace("_", " ")}</span></td>
        </tr>
      `).join("")
    : `<tr><td colspan="5" class="empty-note" style="padding:10px;">No open PRs.</td></tr>`

  // Dev utilisation
  const devRows = data.developerUtilisation.length > 0
    ? data.developerUtilisation.map((d) => `
        <tr>
          <td style="font-weight:500;">${d.name}</td>
          <td style="text-transform:capitalize;">${d.role}</td>
          <td style="text-align:center;">${d.assignedTasks}</td>
          <td style="text-align:center;">${d.completedTasks}</td>
          <td style="text-align:center;">${d.inProgressTasks}</td>
          <td>
            <div class="progress-wrap">
              <div class="progress-bar" style="width:${d.assignedTasks > 0 ? Math.round((d.completedTasks / d.assignedTasks) * 100) : 0}%;"></div>
            </div>
          </td>
        </tr>
      `).join("")
    : `<tr><td colspan="6" class="empty-note" style="padding:10px;">No developer utilisation data available.</td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${baseStyles()}
</head>
<body>
  <!-- PAGE HEADER -->
  <div class="page-header">
    <div class="logo-cell">
      <img class="logo" src="data:image/png;base64,${logoBase64}" alt="GoIP Logo">
    </div>
    <div class="header-vline"></div>
    <div class="header-title">Weekly Engineering Report</div>
    <div class="header-vline"></div>
    <div class="header-date-label">${weekLabel}</div>
  </div>
  <div class="lime-rule"></div>

  <!-- REPORT TITLE BLOCK -->
  <div class="report-title-block">
    <h1>Weekly Engineering Report</h1>
    <div class="report-subtitle">Engineering Department &nbsp;|&nbsp; GoExperience (GOIP)</div>
    <div class="report-period-label">${weekOfLabel}</div>
  </div>

  <!-- META TABLE -->
  <table class="meta-table">
    <tr>
      <td class="label">Prepared By</td>
      <td>Alex Njoroge, Head of Technology and Engineering</td>
    </tr>
    <tr>
      <td class="label">Report Period</td>
      <td>${periodDisplay}</td>
    </tr>
    <tr>
      <td class="label">Report Date</td>
      <td>${formatDate(today)}</td>
    </tr>
    <tr>
      <td class="label">Department</td>
      <td>Engineering and Technology</td>
    </tr>
    <tr>
      <td class="label">Status</td>
      <td>Week Complete</td>
    </tr>
  </table>

  <!-- QUICK STATS -->
  <div class="section">
    <div class="summary-boxes">
      <div class="summary-box">
        <div class="box-num">${totalProjects}</div>
        <div class="box-label">Active Projects</div>
      </div>
      <div class="summary-box lime-box">
        <div class="box-num">${totalCompleted}</div>
        <div class="box-label">Tasks Completed</div>
      </div>
      <div class="summary-box">
        <div class="box-num">${data.prStats.merged}</div>
        <div class="box-label">PRs Merged</div>
      </div>
      <div class="summary-box lime-box">
        <div class="box-num">${totalBlockers}</div>
        <div class="box-label">Active Blockers</div>
      </div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div class="section">
    <div class="section-heading">Executive Summary</div>
    <p class="summary-para">${executiveSummary}</p>
  </div>

  <!-- PROJECT PORTFOLIO STATUS -->
  <div class="section">
    <div class="section-heading">Project Portfolio Status</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Client</th>
          <th>Status</th>
          <th>Sprint Progress</th>
          <th style="text-align:center;">Team</th>
          <th style="text-align:center;">Open Bugs</th>
          <th style="text-align:center;">Blockers</th>
          <th style="text-align:center;">Open PRs</th>
        </tr>
      </thead>
      <tbody>${projectRows}</tbody>
    </table>
  </div>

  <!-- COMPLETED TASKS -->
  <div class="section">
    <div class="section-heading">Completed Tasks This Week</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Task</th>
          <th>Module</th>
          <th>Developer</th>
        </tr>
      </thead>
      <tbody>${completedRows}</tbody>
    </table>
  </div>

  <!-- IN-PROGRESS TASKS -->
  <div class="section">
    <div class="section-heading">In-Progress Tasks Carrying Over</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Task</th>
          <th>Module</th>
          <th>Developer</th>
        </tr>
      </thead>
      <tbody>${inProgressRows}</tbody>
    </table>
  </div>

  <!-- BUGS OPENED vs RESOLVED -->
  <div class="section">
    <div class="section-heading">Critical &amp; High-Severity Bugs</div>
    <p style="font-size:9pt;color:#555F70;margin-bottom:8px;">
      Total open bugs: <strong>${openBugsCount}</strong> &nbsp;|&nbsp;
      Critical / High: <strong>${critBugsCount}</strong>
    </p>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Title</th>
          <th>Severity</th>
          <th>Assigned To</th>
        </tr>
      </thead>
      <tbody>${bugRows}</tbody>
    </table>
  </div>

  <!-- BLOCKERS -->
  <div class="section">
    <div class="section-heading">Blockers Raised vs Resolved</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Title</th>
          <th style="text-align:center;">Age</th>
          <th>Raised By</th>
        </tr>
      </thead>
      <tbody>${blockerRows}</tbody>
    </table>
  </div>

  <!-- PR ACTIVITY SUMMARY -->
  <div class="section">
    <div class="section-heading">PR Activity Summary</div>
    <p style="font-size:9pt;color:#555F70;margin-bottom:8px;">
      Merged this period: <strong>${data.prStats.merged}</strong> &nbsp;|&nbsp;
      Currently open: <strong>${data.prStats.open}</strong>
    </p>
    <table class="data-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>PR Title</th>
          <th>Developer</th>
          <th>Branch</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${prRows}</tbody>
    </table>
  </div>

  <!-- TEAM UTILISATION -->
  <div class="section">
    <div class="section-heading">Developer Utilisation</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Developer</th>
          <th>Role</th>
          <th style="text-align:center;">Total Tasks</th>
          <th style="text-align:center;">Completed</th>
          <th style="text-align:center;">In Progress</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>${devRows}</tbody>
    </table>
  </div>

  <!-- NEXT WEEK PLAN -->
  <div class="section">
    <div class="section-heading">Next Week Plan</div>
    <div class="summary-para">${nextWeekPlan || "To be updated by the Head of Technology and Engineering prior to the next reporting period."}</div>
  </div>

  <!-- ADDITIONAL NOTES -->
  ${input.customNotes ? `
  <div class="section">
    <div class="section-heading">Additional Notes</div>
    <div class="summary-para">${input.customNotes}</div>
  </div>
  ` : ""}
</body>
</html>`
}
