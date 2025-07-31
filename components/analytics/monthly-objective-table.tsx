"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MonthlyData {
  month: string
  staff: number
  structural: number
  average: number
}

interface MonthlyObjectiveTableProps {
  data: MonthlyData[]
  year: string
}

export function MonthlyObjectiveTable({ data, year }: MonthlyObjectiveTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 85) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>REKAP MONTHLY OBJECTIVE - {year}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 bg-emerald-600 text-white">BULAN</th>
                  <th className="text-center p-3 bg-blue-600 text-white">STAFF</th>
                  <th className="text-center p-3 bg-purple-600 text-white">STRUKTURAL</th>
                  <th className="text-center p-3 bg-orange-600 text-white">AVERAGE</th>
                  <th className="text-center p-3 bg-gray-600 text-white">TREND</th>
                </tr>
              </thead>
              <tbody>
                {data.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{month.month}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`font-bold ${getScoreColor(month.staff)}`}>{month.staff.toFixed(2)}%</span>
                        <Progress value={month.staff} className="w-20 h-2" />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`font-bold ${getScoreColor(month.structural)}`}>
                          {month.structural.toFixed(2)}%
                        </span>
                        <Progress value={month.structural} className="w-20 h-2" />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`font-bold text-lg ${getScoreColor(month.average)}`}>
                          {month.average.toFixed(2)}%
                        </span>
                        <Progress value={month.average} className="w-24 h-3" />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {index > 0 && getTrendIcon(month.average, data[index - 1].average)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Keterangan Scoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <div className="font-medium text-blue-800">RUMUS SCORE TAL =</div>
              <div className="text-sm text-blue-600">DP40% + RH20% + WO40%</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium text-blue-800">RUMUS SCORE MO STAF =</div>
              <div className="text-sm text-blue-600">Rata-rata Score TAL dlm 1 bulan</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium text-blue-800">RUMUS SCORE MO STRUKTURAL =</div>
              <div className="text-sm text-blue-600">(Avg Score TAL x 80%) + (MO x 20%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-800">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="font-medium">TAL</span>
              <span className="text-sm text-gray-600">To Achieve List</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="font-medium">DP</span>
              <span className="text-sm text-gray-600">Daily Planning</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="font-medium">RH</span>
              <span className="text-sm text-gray-600">Report Harian</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="font-medium">WO</span>
              <span className="text-sm text-gray-600">Weekly Objective</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="font-medium">MO</span>
              <span className="text-sm text-gray-600">Monthly Objective</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
