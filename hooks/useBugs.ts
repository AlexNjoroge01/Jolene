"use client"

import { useQuery } from "@tanstack/react-query"

export function useBugs(projectId?: number) {
  return useQuery({
    queryKey: ["bugs", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : ""
      const res = await fetch(`/api/bugs${query}`)
      if (!res.ok) throw new Error("Failed to load bugs")
      return res.json()
    },
  })
}
