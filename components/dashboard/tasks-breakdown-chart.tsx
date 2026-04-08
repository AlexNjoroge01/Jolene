"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const COLORS = ["#7AA89E", "#A9C6BE", "#6c757d", "#212529", "#DEE2E6"]

interface TasksBreakdownChartProps {
  data: { name: string; value: number }[]
}

export function TasksBreakdownChart({ data }: TasksBreakdownChartProps) {
  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Task Status</CardTitle>
        <CardDescription>Distribution of all system tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                itemStyle={{ color: "#334155", fontWeight: 500 }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
