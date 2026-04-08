"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DeveloperWorkloadChartProps {
  data: {
    name: string
    tasks: number
  }[]
}

export function DeveloperWorkloadChart({ data }: DeveloperWorkloadChartProps) {
  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Active Developer Workload</CardTitle>
        <CardDescription>Assigned tasks per active developer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.5} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="tasks" name="Active Tasks" fill="#7AA89E" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
