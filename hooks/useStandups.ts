"use client"

import { useQuery } from "@tanstack/react-query"

export function useStandups() {
  return useQuery({
    queryKey: ["standups"],
    queryFn: async () => {
      const res = await fetch("/api/standups")
      if (!res.ok) throw new Error("Failed to load standups")
      return res.json()
    },
  })
}
