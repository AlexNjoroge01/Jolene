"use client"

import { useMemo, useState } from "react"

import { PageHeader } from "@/components/layout/PageHeader"

export default function StandupTodayPage() {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)
  const [running, setRunning] = useState(false)
  const [intervalId, setIntervalId] = useState<number | null>(null)

  const clock = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
    const s = String(secondsLeft % 60).padStart(2, "0")
    return `${m}:${s}`
  }, [secondsLeft])

  function startTimer() {
    if (running) return
    setRunning(true)
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIntervalId(id)
  }

  function resetTimer() {
    if (intervalId) window.clearInterval(intervalId)
    setRunning(false)
    setSecondsLeft(15 * 60)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Standup Facilitator View" description="15-minute guided standup session." />
      <div className="rounded border bg-background p-4">
        <p className="text-4xl font-semibold">{clock}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={startTimer} className="rounded border px-3 py-2 text-sm">
            Start
          </button>
          <button onClick={resetTimer} className="rounded border px-3 py-2 text-sm">
            Reset
          </button>
        </div>
      </div>
      <div className="rounded border bg-background p-4 text-sm text-muted-foreground">
        Use `/standups` to log standup entries and create blocker records.
      </div>
    </div>
  )
}
