"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { MobileTaskCard } from "./mobile-task-card"

interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: "high" | "medium" | "low"
  deadline: string
  completed: boolean
  estimatedTime?: number
  dayOfWeek: number
  createdAt: string
  completedAt?: string
  location?: string
}

interface MobileWeekViewProps {
  tasks: Task[]
  onToggleComplete: (taskId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  categories: Array<{ name: string; color: string; emoji: string }>
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MobileWeekView({ tasks, onToggleComplete, onEditTask, onDeleteTask, categories }: MobileWeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const getTasksForDay = (dayIndex: number) => {
    return tasks.filter((task) => task.dayOfWeek === dayIndex)
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle className="text-lg">Week View</CardTitle>
                <p className="text-sm text-gray-500">{formatWeekRange()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Days */}
      <div className="space-y-4">
        {weekDates.map((date, index) => {
          const dayTasks = getTasksForDay(index)
          const isToday = date.toDateString() === new Date().toDateString()
          const completedCount = dayTasks.filter((task) => task.completed).length

          return (
            <Card key={index} className={`${isToday ? "ring-2 ring-emerald-500 bg-emerald-50" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">{DAYS_OF_WEEK[index]}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {isToday && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-emerald-100 text-emerald-800">
                          Today
                        </Badge>
                      )}
                    </p>
                  </div>
                  {dayTasks.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {completedCount}/{dayTasks.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No tasks scheduled</p>
                ) : (
                  dayTasks.map((task) => (
                    <MobileTaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={() => onToggleComplete(task.id)}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                      categories={categories}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
