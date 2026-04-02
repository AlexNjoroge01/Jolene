"use client"

import { useQuery } from "@tanstack/react-query"

export function useBlockers(projectId?: number) {
  return useQuery({
    queryKey: ["blockers", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : ""
      const res = await fetch(`/api/blockers${query}`)
      if (!res.ok) throw new Error("Failed to load blockers")
      return res.json()
    },
  })
}
