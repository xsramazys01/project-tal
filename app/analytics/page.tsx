"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Calendar, Target, Award, Download, ArrowLeft } from "lucide-react"
import { WeeklyObjectiveTable } from "@/components/analytics/weekly-objective-table"
import { MonthlyObjectiveTable } from "@/components/analytics/monthly-objective-table"
import { PerformanceCharts } from "@/components/analytics/performance-charts"
import { ObjectiveScoring } from "@/components/analytics/objective-scoring"
import { generateMonthlyData, calculateOverallStats } from "@/lib/analytics-utils"
import Link from "next/link"

// Updated sample data with 2025 dates
const SAMPLE_TASKS = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Finish the Q1 project proposal for client review",
    category: "Work",
    priority: "high" as const,
    deadline: "2025-01-15T17:00",
    completed: true,
    estimatedTime: 3,
    dayOfWeek: 1,
    createdAt: "2025-01-14T10:00",
    completedAt: "2025-01-15T16:30",
  },
  {
    id: "2",
    title: "Morning workout",
    category: "Health",
    priority: "medium" as const,
    deadline: "2025-01-15T08:00",
    completed: true,
    estimatedTime: 1,
    dayOfWeek: 1,
    createdAt: "2025-01-14T08:00",
    completedAt: "2025-01-15T08:30",
  },
  {
    id: "3",
    title: "Read 30 pages of book",
    category: "Learning",
    priority: "low" as const,
    deadline: "2025-01-16T22:00",
    completed: false,
    estimatedTime: 1,
    dayOfWeek: 2,
    createdAt: "2025-01-14T12:00",
  },
  {
    id: "4",
    title: "Team meeting preparation",
    description: "Prepare slides and agenda for weekly team meeting",
    category: "Work",
    priority: "high" as const,
    deadline: "2025-01-17T09:00",
    completed: true,
    estimatedTime: 2,
    dayOfWeek: 3,
    createdAt: "2025-01-15T14:00",
    completedAt: "2025-01-16T18:00",
  },
  {
    id: "5",
    title: "Grocery shopping",
    category: "Personal",
    priority: "medium" as const,
    deadline: "2025-01-18T19:00",
    completed: true,
    estimatedTime: 1,
    dayOfWeek: 4,
    createdAt: "2025-01-16T10:00",
    completedAt: "2025-01-18T17:30",
  },
  {
    id: "6",
    title: "Review financial reports",
    description: "Analyze Q4 financial performance",
    category: "Finance",
    priority: "high" as const,
    deadline: "2025-01-19T17:00",
    completed: false,
    estimatedTime: 3,
    dayOfWeek: 5,
    createdAt: "2025-01-17T09:00",
  },
  {
    id: "7",
    title: "Plan vacation trip",
    description: "Research and book summer vacation",
    category: "Personal",
    priority: "low" as const,
    deadline: "2025-01-25T23:59",
    completed: false,
    estimatedTime: 2,
    dayOfWeek: 6,
    createdAt: "2025-01-20T15:00",
  },
  {
    id: "8",
    title: "Update portfolio website",
    description: "Add recent projects and update design",
    category: "Work",
    priority: "medium" as const,
    deadline: "2025-01-30T17:00",
    completed: true,
    estimatedTime: 4,
    dayOfWeek: 0,
    createdAt: "2025-01-21T09:00",
    completedAt: "2025-01-28T16:45",
  },
  {
    id: "9",
    title: "Doctor appointment",
    category: "Health",
    priority: "high" as const,
    deadline: "2025-01-31T14:00",
    completed: true,
    estimatedTime: 1,
    dayOfWeek: 4,
    createdAt: "2025-01-25T11:00",
    completedAt: "2025-01-31T14:30",
  },
  {
    id: "10",
    title: "Learn React Native",
    description: "Complete online course on mobile development",
    category: "Learning",
    priority: "medium" as const,
    deadline: "2025-02-05T23:59",
    completed: false,
    estimatedTime: 8,
    dayOfWeek: 2,
    createdAt: "2025-01-28T20:00",
  },
]

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [activeTab, setActiveTab] = useState("weekly")
  const [tasks, setTasks] = useState(SAMPLE_TASKS)

  // In a real app, you would fetch tasks from your global state or API
  useEffect(() => {
    // This is where you would fetch real task data
    // For now, we'll use the sample data with current year
    setTasks(SAMPLE_TASKS)
  }, [])

  // Generate analytics data from real tasks
  const monthlyData = generateMonthlyData(tasks, Number.parseInt(selectedYear))
  const overallStats = calculateOverallStats(monthlyData)

  // Filter data by selected month if not "all"
  const filteredMonthlyData =
    selectedMonth === "all"
      ? monthlyData
      : monthlyData.filter((_, index) => index === Number.parseInt(selectedMonth) - 1)

  const weeklyData = filteredMonthlyData.map((month) => ({
    month: month.month,
    weeks: month.weeklyData,
  }))

  const scoringFormulas = {
    weekly: "DP40% + RH20% + WO40%",
    monthly: "Rata-rata Score TAL dlm 1 bulan",
    structural: "(Avg Score TAL x 80%) + (MO x 20%)",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <BarChart3 className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics & Objectives</h1>
            <p className="text-sm text-gray-500">Performance tracking and goal analysis - {selectedYear}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="1">January</SelectItem>
              <SelectItem value="2">February</SelectItem>
              <SelectItem value="3">March</SelectItem>
              <SelectItem value="4">April</SelectItem>
              <SelectItem value="5">May</SelectItem>
              <SelectItem value="6">June</SelectItem>
              <SelectItem value="7">July</SelectItem>
              <SelectItem value="8">August</SelectItem>
              <SelectItem value="9">September</SelectItem>
              <SelectItem value="10">October</SelectItem>
              <SelectItem value="11">November</SelectItem>
              <SelectItem value="12">December</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Current Date Info */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Current Analytics Period</h3>
                <p className="text-sm text-blue-700">
                  Showing data for {selectedYear} • {tasks.length} total tasks • Last updated:{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">Current Week</div>
                <div className="font-medium text-blue-900">
                  Week {Math.ceil(new Date().getDate() / 7)} of{" "}
                  {new Date().toLocaleDateString("en-US", { month: "long" })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">Overall Score</p>
                  <p className="text-2xl font-bold text-emerald-600">{overallStats.overallScore}%</p>
                  <p className="text-xs text-emerald-600 mt-1">Grade: {overallStats.achievement}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Weekly Average</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.weeklyAverage}%</p>
                  <p className="text-xs text-blue-600 mt-1">This {selectedYear}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Monthly Target</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.monthlyTarget}%</p>
                  <p className="text-xs text-purple-600 mt-1">Target Goal</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700">Achievement</p>
                  <p className="text-2xl font-bold text-orange-600">{overallStats.achievement}</p>
                  <p className="text-xs text-orange-600 mt-1">Performance Grade</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weekly">Weekly Objectives</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Objectives</TabsTrigger>
            <TabsTrigger value="charts">Performance Charts</TabsTrigger>
            <TabsTrigger value="scoring">Scoring System</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <WeeklyObjectiveTable data={weeklyData} year={selectedYear} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyObjectiveTable data={filteredMonthlyData} year={selectedYear} />
          </TabsContent>

          <TabsContent value="charts">
            <PerformanceCharts weeklyData={weeklyData} monthlyData={filteredMonthlyData} />
          </TabsContent>

          <TabsContent value="scoring">
            <ObjectiveScoring formulas={scoringFormulas} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
