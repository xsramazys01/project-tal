"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useMemo } from "react"

export function WeeklyProgress() {
  const { tasks, loading } = useTasks()

  const weeklyStats = useMemo(() => {
    if (!tasks.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        todayTasks: 0,
        todayCompleted: 0,
      }
    }

    const now = new Date()
    const today = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - today)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Filter tasks for current week
    const weekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.created_at)
      return taskDate >= startOfWeek && taskDate <= endOfWeek
    })

    const completedTasks = weekTasks.filter((task) => task.completed).length
    const overdueTasks = weekTasks.filter(
      (task) => !task.completed && task.deadline && new Date(task.deadline) < now,
    ).length

    // Today's tasks
    const todayTasks = weekTasks.filter((task) => task.day_of_week === today)
    const todayCompleted = todayTasks.filter((task) => task.completed).length

    return {
      totalTasks: weekTasks.length,
      completedTasks,
      overdueTasks,
      completionRate: weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0,
      todayTasks: todayTasks.length,
      todayCompleted,
    }
  }, [tasks])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm text-gray-600">
              {weeklyStats.completedTasks}/{weeklyStats.totalTasks} tasks
            </span>
          </div>
          <Progress value={weeklyStats.completionRate} className="h-2" />
          <div className="text-right">
            <Badge variant={weeklyStats.completionRate >= 80 ? "default" : "secondary"}>
              {weeklyStats.completionRate}%
            </Badge>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Today's Tasks</span>
            <span className="text-sm text-gray-600">
              {weeklyStats.todayCompleted}/{weeklyStats.todayTasks} completed
            </span>
          </div>
          <Progress
            value={weeklyStats.todayTasks > 0 ? (weeklyStats.todayCompleted / weeklyStats.todayTasks) * 100 : 0}
            className="h-2"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{weeklyStats.completedTasks}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyStats.totalTasks - weeklyStats.completedTasks}
            </div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{weeklyStats.overdueTasks}</div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
