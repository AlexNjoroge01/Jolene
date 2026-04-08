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
        line-height: 1.5;
      }
      .page-header {
        display: flex;
        align-items: center;
        padding: 10px 28px;
        gap: 0;
      }
      .logo-cell {
        display: flex;
        align-items: center;
        min-width: 130px;
      }
      .logo {
        height: 44px;
        object-fit: contain;
      }
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
        min-width: 120px;
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
        margin-bottom: 10px;
      }
      .day-block { margin-bottom: 14px; page-break-inside: avoid; }
      .day-header {
        background: #1B2D4F;
        color: white;
        padding: 7px 14px;
        font-weight: bold;
        font-size: 10.5pt;
        letter-spacing: 0.5px;
      }
      .day-activities { border: 1px solid #D8DEE8; border-top: none; }
      .day-activity {
        display: flex;
        padding: 7px 14px;
        border-bottom: 1px solid #D8DEE8;
        font-size: 9.5pt;
        align-items: flex-start;
      }
      .day-activity:last-child { border-bottom: none; }
      .activity-num {
        color: #6DBE45;
        font-weight: bold;
        min-width: 22px;
        padding-right: 4px;
        flex-shrink: 0;
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
      .badge-low { background: #f0fff0; color: #155724; }
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
      .summary-box .box-num {
        font-size: 20pt;
        font-weight: bold;
        color: #1B2D4F;
      }
      .summary-box .box-label {
        font-size: 8pt;
        color: #555F70;
        margin-top: 2px;
      }
      .summary-box.lime-box { border-color: #6DBE45; }
      .summary-box.lime-box .box-num { color: #6DBE45; }
      .empty-note { color: #888; font-style: italic; font-size: 9pt; padding: 8px 0; }
      @page { margin: 14mm 14mm 22mm 14mm; size: A4; }
    </style>
  `
}

function pageFooterTemplate() {
  return `
    <div style="font-size:8pt;color:#555F70;width:100%;padding:4px 28px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid #6DBE45;font-family:Arial,sans-serif;">
      <span>GoExperience (GOIP) &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Internal Use Only</span>
      <span><span class="pageNumber"></span></span>
    </div>
  `
}

export type HODReportInput = {
  title: string
  periodStart?: string
  periodEnd?: string
  customNotes?: string
  data: ReportData
  logoBase64: string
}

export function renderHODMondayReport(input: HODReportInput): string {
  const { title, periodStart, periodEnd, data, logoBase64, customNotes } = input
  const today = new Date()
  let html: string = ""
  const periodDisplay =
    periodStart && periodEnd
      ? `${shortDate(periodStart)} to ${shortDate(periodEnd)}`
      : shortDate(today)
  const weekLabel = periodEnd ? `W/E ${shortDate(periodEnd)}` : shortDate(today)

  // Daily activities HTML
  const dailyHtml = data.dailyActivities.length > 0
    ? data.dailyActivities.map((day) => `
      <div class="day-block">
        <div class="day-header">${day.dayName.toUpperCase()} &nbsp;|&nbsp; ${day.date}</div>
        <div class="day-activities">
          ${day.activities.map((act, i) => `
            <div class="day-activity">
              <span class="activity-num">${i + 1}.</span>
              <span>${act}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("")
    : `<div class="empty-note">No daily activities logged for this period.</div>`

  // Project status table
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
    </tr>
  `).join("") || `<tr><td colspan="7" class="empty-note" style="padding:10px;">No projects in this period.</td></tr>`

  // Blockers table
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

  // Critical bugs table
  const bugRows = data.criticalBugs.length > 0
    ? data.criticalBugs.map((b) => `
        <tr>
          <td style="font-weight:500;">${b.projectName}</td>
          <td>${b.title}</td>
          <td><span class="badge badge-${b.severity}">${b.severity.toUpperCase()}</span></td>
          <td>${b.assignedToName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" class="empty-note" style="padding:10px;">No critical bugs open. ✓</td></tr>`

  // Dev utilisation table
  const devRows = data.developerUtilisation.length > 0
    ? data.developerUtilisation.map((d) => `
        <tr>
          <td style="font-weight:500;">${d.name}</td>
          <td style="text-transform:capitalize;">${d.role}</td>
          <td style="text-align:center;">${d.assignedTasks}</td>
          <td style="text-align:center;">${d.completedTasks}</td>
          <td style="text-align:center;">${d.inProgressTasks}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="5" class="empty-note" style="padding:10px;">No developer data available.</td></tr>`

  // Summary boxes
  const totalProjects = data.projects.length
  const totalBlockers = data.blockers.length
  const totalOpenPRs = data.prStats.open
  const totalCriticalBugs = data.criticalBugs.length

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
    <div class="header-title">Daily Activity Log</div>
    <div class="header-vline"></div>
    <div class="header-date-label">${weekLabel}</div>
  </div>
  <div class="lime-rule"></div>

  <!-- REPORT TITLE BLOCK -->
  <div class="report-title-block">
    <h1>Daily Activity Log</h1>
    <div class="report-subtitle">Engineering Department &nbsp;|&nbsp; GoExperience (GOIP)</div>
    <div class="report-period-label">${periodDisplay}</div>
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
      <td class="label">Classification</td>
      <td>Confidential &ndash; Internal Use Only</td>
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
        <div class="box-num">${totalBlockers}</div>
        <div class="box-label">Active Blockers</div>
      </div>
      <div class="summary-box">
        <div class="box-num">${totalOpenPRs}</div>
        <div class="box-label">Open PRs</div>
      </div>
      <div class="summary-box lime-box">
        <div class="box-num">${totalCriticalBugs}</div>
        <div class="box-label">Critical / High Bugs</div>
      </div>
    </div>
  </div>

  <!-- DAILY ACTIVITY LOG -->
  <div class="section">
    <div class="section-heading">Weekly Activity Summary</div>
    ${dailyHtml}
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
        </tr>
      </thead>
      <tbody>${projectRows}</tbody>
    </table>
  </div>

  <!-- OPEN BLOCKERS -->
  <div class="section">
    <div class="section-heading">Open Blockers</div>
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

  <!-- CRITICAL BUGS -->
  <div class="section">
    <div class="section-heading">Critical &amp; High-Severity Bugs</div>
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

  <!-- PR ACTIVITY -->
  <div class="section">
    <div class="section-heading">PR Activity</div>
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
      <tbody>
        ${data.prStats.openPRs.length > 0
          ? data.prStats.openPRs.map((pr) => `
              <tr>
                <td>${pr.projectName}</td>
                <td>${pr.title}</td>
                <td>${pr.developerName}</td>
                <td style="font-size:8pt;font-family:monospace;">${pr.branch}</td>
                <td><span class="badge badge-medium">${pr.status.replace("_", " ")}</span></td>
              </tr>
            `).join("")
          : `<tr><td colspan="5" class="empty-note" style="padding:10px;">No open PRs.</td></tr>`
        }
      </tbody>
    </table>
    <p style="font-size:9pt;color:#555F70;margin-top:6px;">
      Merged this period: <strong>${data.prStats.merged}</strong> &nbsp;|&nbsp;
      Currently open: <strong>${data.prStats.open}</strong>
    </p>
  </div>

  <!-- TEAM UTILISATION -->
  <div class="section">
    <div class="section-heading">Team Utilisation</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Developer</th>
          <th>Role</th>
          <th style="text-align:center;">Total Tasks</th>
          <th style="text-align:center;">Completed</th>
          <th style="text-align:center;">In Progress</th>
        </tr>
      </thead>
      <tbody>${devRows}</tbody>
    </table>
  </div>

  <!-- EXECUTIVE SUMMARY / NOTES -->
  ${input.customNotes ? `
  <div class="section">
    <div class="section-heading">Executive Summary & Notes</div>
    <div class="summary-para">${input.customNotes}</div>
  </div>
  ` : ""}
</body>
</html>`
}
