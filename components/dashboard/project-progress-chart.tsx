"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ProjectsProgressChartProps {
  data: {
    name: string
    completed: number
    remaining: number
  }[]
}

export function ProjectsProgressChart({ data }: ProjectsProgressChartProps) {
  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Project Progress</CardTitle>
        <CardDescription>Task completion status per active project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#7AA89E" radius={[0, 0, 4, 4]} />
              <Bar dataKey="remaining" name="Remaining Tasks" stackId="a" fill="#E4EAE9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
