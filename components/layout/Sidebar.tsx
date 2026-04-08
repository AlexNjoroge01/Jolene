"use client"

import {
  ClipboardList,
  FolderKanban,
  GitPullRequestArrow,
  Home,
  ListChecks,
  Timer,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { BRAND_COLORS } from "@/constants/brandColors"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Command Center", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: Users },
  { href: "/sprints", label: "Sprints", icon: ListChecks },
  { href: "/standups", label: "Standups", icon: Timer },
  { href: "/prs", label: "PR Review", icon: GitPullRequestArrow },
  { href: "/reports", label: "Reports", icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="sticky top-0 flex h-screen w-72 flex-col border-r p-4"
      style={{ backgroundColor: BRAND_COLORS.NAVY }}
    >
      <div className="mb-8 px-3 py-2">
        <p className="text-xl font-semibold text-white">Jolene</p>
        <p className="text-sm text-white/70">GOIP Engineering Ops</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
