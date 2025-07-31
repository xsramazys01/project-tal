"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"

interface WeekData {
  week: number
  status: "completed" | "late" | "not_sent"
  dp: number
  rh: number
  wo: number
  total: number
  percentage: number
  tasks?: any[]
}

interface MonthData {
  month: string
  weeks: WeekData[]
}

interface WeeklyObjectiveTableProps {
  data: MonthData[]
  year: string
}

export function WeeklyObjectiveTable({ data, year }: WeeklyObjectiveTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        )
      case "not_sent":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Not Sent
          </Badge>
        )
      default:
        return null
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600"
    if (percentage >= 85) return "text-blue-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  // Calculate summary statistics
  const allWeeks = data.flatMap((month) => month.weeks)
  const avgScore = allWeeks.length > 0 ? allWeeks.reduce((sum, week) => sum + week.percentage, 0) / allWeeks.length : 0
  const completedWeeks = allWeeks.filter((week) => week.status === "completed").length
  const onTimeDelivery = allWeeks.length > 0 ? (completedWeeks / allWeeks.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>WEEKLY OBJECTIVE TRACKING - {year}</span>
          <div className="text-sm text-gray-500">SCORE = DP 40% + RH 20% + WO 40%</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">No weekly data found for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 bg-blue-600 text-white font-semibold">MONTH</th>
                    <th className="text-center p-3 bg-blue-600 text-white font-semibold">WEEK</th>
                    <th className="text-center p-3 bg-gray-600 text-white font-semibold">DP</th>
                    <th className="text-center p-3 bg-gray-600 text-white font-semibold">RH</th>
                    <th className="text-center p-3 bg-gray-600 text-white font-semibold">WO</th>
                    <th className="text-center p-3 bg-emerald-600 text-white font-semibold">TOTAL SCORE</th>
                    <th className="text-center p-3 bg-purple-600 text-white font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((monthData, monthIndex) =>
                    monthData.weeks.map((week, weekIndex) => (
                      <tr key={`${monthIndex}-${weekIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                        {weekIndex === 0 && (
                          <td
                            rowSpan={monthData.weeks.length}
                            className="p-3 border-r border-gray-200 font-semibold bg-gray-50 text-gray-900"
                          >
                            {monthData.month}
                          </td>
                        )}
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-sm font-semibold">Week {week.week}</span>
                            {week.tasks && <span className="text-xs text-gray-500">{week.tasks.length} tasks</span>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm">{week.dp.toFixed(1)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm">{week.rh.toFixed(1)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm">{week.wo.toFixed(1)}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <span className={`font-bold text-lg ${getScoreColor(week.percentage)}`}>
                              {week.percentage.toFixed(1)}%
                            </span>
                            <Progress value={week.percentage} className="w-20 h-2" />
                          </div>
                        </td>
                        <td className="p-3 text-center">{getStatusBadge(week.status)}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{avgScore.toFixed(1)}%</div>
                  <div className="text-sm text-emerald-700">Average Weekly Score</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {completedWeeks}/{allWeeks.length}
                  </div>
                  <div className="text-sm text-blue-700">Weeks Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{onTimeDelivery.toFixed(0)}%</div>
                  <div className="text-sm text-purple-700">On-Time Delivery</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
