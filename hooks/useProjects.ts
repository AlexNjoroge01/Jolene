"use client"

import { useQuery } from "@tanstack/react-query"

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to load projects")
      return res.json()
    },
  })
}
