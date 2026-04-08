"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileBarChart2,
  FileText,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react"

type ReportType = "hod_monday" | "weekly_eow" | "custom"

interface Project {
  id: number
  name: string
  client: string
  status: string
}

const REPORT_TYPES: {
  id: ReportType
  label: string
  description: string
  icon: React.ReactNode
  sections: string[]
}[] = [
  {
    id: "hod_monday",
    label: "HOD Activity Log",
    description: "Daily activity breakdown for the week — blockers, project status, team utilisation.",
    icon: <FileText className="h-6 w-6" />,
    sections: [
      "Daily Activity Summary",
      "Project Portfolio Status",
      "Open Blockers",
      "Critical Bugs",
      "PR Activity",
      "Team Utilisation",
    ],
  },
  {
    id: "weekly_eow",
    label: "Weekly Engineering Report",
    description: "Formal end-of-week report — executive summary, completed tasks, bugs, PRs, next week plan.",
    icon: <FileBarChart2 className="h-6 w-6" />,
    sections: [
      "Executive Summary",
      "Project Portfolio Status",
      "Completed Tasks",
      "In-Progress Tasks",
      "Bugs & Blockers",
      "PR Activity Summary",
      "Developer Utilisation",
      "Next Week Plan",
    ],
  },
  {
    id: "custom",
    label: "Custom Project Report",
    description: "Focused report for a specific project or date range.",
    icon: <Layers className="h-6 w-6" />,
    sections: [
      "Executive Summary",
      "Project Portfolio Status",
      "Completed Tasks",
      "Bugs & Blockers",
      "PR Activity",
    ],
  },
]

const STEPS = [
  { id: 1, label: "Report Type" },
  { id: 2, label: "Date Range" },
  { id: 3, label: "Projects" },
  { id: 4, label: "Details" },
  { id: 5, label: "Generate" },
]

export default function NewReportPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [reportType, setReportType] = useState<ReportType>("weekly_eow")
  const [title, setTitle] = useState("")
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [nextWeekPlan, setNextWeekPlan] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-populate title when type changes
  useEffect(() => {
    const typeLabel = REPORT_TYPES.find((t) => t.id === reportType)?.label ?? ""
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    setTitle(`${typeLabel} — ${today}`)
  }, [reportType])

  // Load projects on step 3
  useEffect(() => {
    if (step === 3) {
      setLoadingProjects(true)
      fetch("/api/projects")
        .then((r) => r.json())
        .then((d) => {
          const list: Project[] = d.data ?? []
          setProjects(list)
          setSelectedProjectIds(list.map((p) => p.id))
        })
        .catch(() => {})
        .finally(() => setLoadingProjects(false))
    }
  }, [step])

  function toggleProject(id: number) {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          title,
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
          nextWeekPlan: nextWeekPlan || undefined,
          projectIds: selectedProjectIds.length > 0 ? selectedProjectIds : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? "Generation failed")
      setGeneratedUrl(json.data?.pdfUrl ?? null)
      setStep(5)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred generating the report.")
    } finally {
      setGenerating(false)
    }
  }

  const selectedType = REPORT_TYPES.find((t) => t.id === reportType)!

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/reports")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Generate Report</h1>
          <p className="text-sm text-muted-foreground">
            Build branded GoExperience PDF reports
          </p>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-0">
        {STEPS.filter((s) => s.id <= 4).map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step > s.id
                    ? "bg-[#6DBE45] text-white"
                    : step === s.id
                      ? "bg-[#1B2D4F] text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={`text-xs font-medium ${
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 3 && (
              <div
                className={`mb-5 h-0.5 w-16 transition-all ${
                  step > s.id ? "bg-[#6DBE45]" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1 — Report Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Report Type</h2>
          <div className="grid gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                  reportType === type.id
                    ? "border-[#6DBE45] bg-[#6DBE45]/5 ring-2 ring-[#6DBE45]/30"
                    : "border-border bg-background hover:border-[#1B2D4F]/40 hover:bg-muted/30"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-lg p-2 ${
                    reportType === type.id
                      ? "bg-[#6DBE45] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {type.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{type.label}</span>
                    {reportType === type.id && (
                      <CheckCircle2 className="h-5 w-5 text-[#6DBE45]" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {type.sections.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl bg-[#1B2D4F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2D4F]/90 transition-colors"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Date Range */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Period</h2>
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-[#6DBE45]" />
                  Period Start
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE45]/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-[#6DBE45]" />
                  Period End
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE45]/40"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Report title"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE45]/40"
              />
            </div>
            {/* Quick presets */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "This week", fn: () => {
                    const now = new Date()
                    const monday = new Date(now)
                    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
                    const friday = new Date(monday)
                    friday.setDate(monday.getDate() + 4)
                    setPeriodStart(monday.toISOString().slice(0, 10))
                    setPeriodEnd(friday.toISOString().slice(0, 10))
                  }},
                  { label: "Last week", fn: () => {
                    const now = new Date()
                    const lastMonday = new Date(now)
                    lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7)
                    const lastFriday = new Date(lastMonday)
                    lastFriday.setDate(lastMonday.getDate() + 4)
                    setPeriodStart(lastMonday.toISOString().slice(0, 10))
                    setPeriodEnd(lastFriday.toISOString().slice(0, 10))
                  }},
                  { label: "This month", fn: () => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    setPeriodStart(start.toISOString().slice(0, 10))
                    setPeriodEnd(end.toISOString().slice(0, 10))
                  }},
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={preset.fn}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-[#6DBE45] hover:text-[#6DBE45] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-[#1B2D4F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2D4F]/90 transition-colors"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Project Selection */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select Projects</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProjectIds(projects.map((p) => p.id))}
                className="rounded-lg px-3 py-1 text-xs font-medium text-[#6DBE45] hover:bg-[#6DBE45]/10 transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => setSelectedProjectIds([])}
                className="rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-background overflow-hidden">
            {loadingProjects ? (
              <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading projects…</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No projects found. The report will use all available data.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {projects.map((project) => {
                  const selected = selectedProjectIds.includes(project.id)
                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        selected ? "bg-[#6DBE45]/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                          selected
                            ? "border-[#6DBE45] bg-[#6DBE45]"
                            : "border-border bg-background"
                        }`}
                      >
                        {selected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.client}</p>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          project.status === "active"
                            ? "bg-[#6DBE45]/15 text-[#3a7d1e]"
                            : project.status === "paused"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedProjectIds.length} of {projects.length} projects selected
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 rounded-xl bg-[#1B2D4F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1B2D4F]/90 transition-colors"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Details & Preview Summary */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Review &amp; Generate</h2>

          {/* Summary card */}
          <div className="rounded-xl border bg-background overflow-hidden">
            <div className="bg-[#1B2D4F] px-5 py-3">
              <p className="text-sm font-semibold text-white">{title}</p>
            </div>
            <div className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-muted-foreground">Report type</span>
                <span className="font-medium">{selectedType.label}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-muted-foreground">Prepared by</span>
                <span className="font-medium">Alex Njoroge, Head of Technology and Engineering</span>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium">
                  {periodStart && periodEnd
                    ? `${periodStart} → ${periodEnd}`
                    : "All time"}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-muted-foreground">Projects</span>
                <span className="font-medium">
                  {selectedProjectIds.length > 0
                    ? `${selectedProjectIds.length} selected`
                    : "All projects"}
                </span>
              </div>
              <div className="px-5 py-2.5">
                <p className="text-muted-foreground mb-1">Sections included</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedType.sections.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 rounded-md bg-[#6DBE45]/10 px-2 py-0.5 text-xs font-medium text-[#3a7d1e]"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next week plan (only for weekly) */}
          {reportType === "weekly_eow" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Next Week Plan{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={nextWeekPlan}
                onChange={(e) => setNextWeekPlan(e.target.value)}
                rows={4}
                placeholder="Enter the plan for next week…"
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE45]/40"
              />
            </div>
          )}

          {/* Branding preview badge */}
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#1B2D4F]/30 bg-[#1B2D4F]/5 px-4 py-3">
            <Sparkles className="h-5 w-5 flex-shrink-0 text-[#6DBE45]" />
            <p className="text-xs text-muted-foreground">
              The PDF will be branded with the <strong className="text-foreground">GoExperience (GOIP)</strong> logo,
              navy &amp; lime color scheme, and will include your name and title at the top of every report.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-xl bg-[#6DBE45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5aad35] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 — Done */}
      {step === 5 && (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6DBE45]/15">
            <CheckCircle2 className="h-10 w-10 text-[#6DBE45]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Report Generated!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your branded PDF report has been created and saved.
            </p>
          </div>
          {generatedUrl && (
            <a
              href={generatedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#1B2D4F] px-8 py-3 text-sm font-semibold text-white hover:bg-[#1B2D4F]/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </a>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1)
                setGeneratedUrl(null)
                setError(null)
              }}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Generate Another
            </button>
            <button
              onClick={() => router.push("/reports")}
              className="flex items-center gap-2 rounded-xl border border-[#6DBE45] px-5 py-2.5 text-sm font-medium text-[#6DBE45] hover:bg-[#6DBE45]/10 transition-colors"
            >
              View Report History <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
