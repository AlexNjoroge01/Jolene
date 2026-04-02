"use client"

import { useQuery } from "@tanstack/react-query"

export function usePRs() {
  return useQuery({
    queryKey: ["prs"],
    queryFn: async () => {
      const res = await fetch("/api/pull-requests")
      if (!res.ok) throw new Error("Failed to load pull requests")
      return res.json()
    },
  })
}
