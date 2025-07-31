"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface WeekData {
  week: number
  status: string
  dp: number
  rh: number
  wo: number
  total: number
  percentage: number
}

interface MonthData {
  month: string
  weeks: WeekData[]
}

interface MonthlyData {
  month: string
  staff: number
  structural: number
  average: number
  weeklyData: WeekData[]
}

interface PerformanceChartsProps {
  weeklyData: MonthData[]
  monthlyData: MonthlyData[]
}

export function PerformanceCharts({ weeklyData, monthlyData }: PerformanceChartsProps) {
  // Prepare data for charts
  const weeklyTrendData = weeklyData.flatMap((month, monthIndex) =>
    month.weeks.map((week, weekIndex) => ({
      name: `${month.month.slice(0, 3)} W${week.week}`,
      score: week.percentage,
      dp: week.dp,
      rh: week.rh,
      wo: week.wo,
    })),
  )

  const monthlyTrendData = monthlyData.map((month) => ({
    name: month.month.slice(0, 3),
    staff: month.staff,
    structural: month.structural,
    average: month.average,
  }))

  // Calculate performance distribution
  const allScores = weeklyTrendData.map((item) => item.score)
  const excellent = allScores.filter((score) => score >= 95).length
  const good = allScores.filter((score) => score >= 85 && score < 95).length
  const fair = allScores.filter((score) => score >= 75 && score < 85).length
  const poor = allScores.filter((score) => score < 75).length
  const total = allScores.length || 1

  const performanceDistribution = [
    { name: "Excellent (95-100%)", value: Math.round((excellent / total) * 100), color: "#10b981" },
    { name: "Good (85-94%)", value: Math.round((good / total) * 100), color: "#f59e0b" },
    { name: "Fair (75-84%)", value: Math.round((fair / total) * 100), color: "#ef4444" },
    { name: "Poor (<75%)", value: Math.round((poor / total) * 100), color: "#6b7280" },
  ]

  const componentBreakdown = weeklyTrendData.slice(-8) // Last 8 weeks

  return (
    <div className="space-y-6">
      {/* Weekly Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} name="Weekly Score %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No weekly data available</div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="staff" fill="#3b82f6" name="Staff Score" />
                <Bar dataKey="structural" fill="#8b5cf6" name="Structural Score" />
                <Bar dataKey="average" fill="#10b981" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No monthly data available</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {allScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Score Component Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {componentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={componentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="dp" stackId="a" fill="#3b82f6" name="Daily Planning (40%)" />
                  <Bar dataKey="rh" stackId="a" fill="#f59e0b" name="Report Harian (20%)" />
                  <Bar dataKey="wo" stackId="a" fill="#10b981" name="Weekly Objective (40%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No component data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
