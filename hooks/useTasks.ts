"use client"

import { useQuery } from "@tanstack/react-query"

export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const query = projectId ? `?projectId=${projectId}` : ""
      const res = await fetch(`/api/tasks${query}`)
      if (!res.ok) throw new Error("Failed to load tasks")
      return res.json()
    },
  })
}
