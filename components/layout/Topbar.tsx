import { Bell, CalendarDays } from "lucide-react"

import { auth } from "@/lib/auth"

export async function Topbar() {
  const session = await auth()
  const userName = session?.user?.name ?? "HOD"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">GoExperience</p>
        <p className="text-sm font-medium">Head of Technology Command Console</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="hidden items-center gap-2 text-muted-foreground md:flex">
          <CalendarDays className="size-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <Bell className="size-4 text-muted-foreground" />
        <span className="font-medium">{userName}</span>
      </div>
    </header>
  )
}
