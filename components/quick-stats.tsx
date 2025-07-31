"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useMemo } from "react"

export function QuickStats() {
  const { tasks, inboxTasks, loading } = useTasks()

  const stats = useMemo(() => {
    const allTasks = [...tasks, ...inboxTasks]
    const completedTasks = allTasks.filter((task) => task.completed)
    const pendingTasks = allTasks.filter((task) => !task.completed)

    const now = new Date()
    const overdueTasks = pendingTasks.filter((task) => task.deadline && new Date(task.deadline) < now)

    // Today's tasks
    const today = now.getDay()
    const todayTasks = tasks.filter((task) => task.day_of_week === today)
    const todayCompleted = todayTasks.filter((task) => task.completed)

    // This week's completion rate
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - today)
    weekStart.setHours(0, 0, 0, 0)

    const weekTasks = allTasks.filter((task) => {
      const taskDate = new Date(task.created_at)
      return taskDate >= weekStart
    })

    const weekCompleted = weekTasks.filter((task) => task.completed)
    const completionRate = weekTasks.length > 0 ? Math.round((weekCompleted.length / weekTasks.length) * 100) : 0

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      inboxCount: inboxTasks.length,
      todayTasks: todayTasks.length,
      todayCompleted: todayCompleted.length,
      completionRate,
    }
  }, [tasks, inboxTasks])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      description: `${stats.completedTasks} completed`,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Today's Tasks",
      value: stats.todayTasks,
      description: `${stats.todayCompleted} completed`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      description: `${stats.overdueTasks} overdue`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      description: "This week",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            {stat.title === "Pending" && stats.inboxCount > 0 && (
              <Badge variant="secondary" className="mt-2">
                {stats.inboxCount} in inbox
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
