"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface SprintsProgressChartProps {
  data: {
    name: string
    totalTasks: number
    completedTasks: number
  }[]
}

export function SprintsProgressChart({ data }: SprintsProgressChartProps) {
  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Active Sprints Velocity</CardTitle>
        <CardDescription>Total vs Completed tasks for active sprints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Line type="monotone" dataKey="totalTasks" name="Total Tasks" stroke="#212529" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="completedTasks" name="Completed Tasks" stroke="#7AA89E" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
