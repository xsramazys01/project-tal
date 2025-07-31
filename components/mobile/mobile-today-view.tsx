"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, ChevronRight } from "lucide-react"
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

interface MobileTodayViewProps {
  tasks: Task[]
  todayProgress: number
  upcomingTasks: Task[]
  overdueTasks: Task[]
  onToggleComplete: (taskId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  categories: Array<{ name: string; color: string; emoji: string }>
}

export function MobileTodayView({
  tasks,
  todayProgress,
  upcomingTasks,
  overdueTasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  categories,
}: MobileTodayViewProps) {
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed)

  return (
    <div className="space-y-4">
      {/* Today's Progress */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span className="font-medium">
                {completedTasks}/{tasks.length} tasks
              </span>
            </div>
            <Progress value={todayProgress} className="h-3" />
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-600">{todayProgress}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-600">{completedTasks}</div>
            <div className="text-xs text-blue-700">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-600">{pendingTasks.length}</div>
            <div className="text-xs text-orange-700">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No tasks for today</h3>
              <p className="text-sm text-gray-500">Tap the + button to add your first task</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <MobileTaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => onToggleComplete(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks Preview */}
      {upcomingTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Coming Up</h2>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 2).map((task) => (
              <Card key={task.id} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(task.deadline).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
