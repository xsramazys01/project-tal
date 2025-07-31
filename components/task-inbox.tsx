"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Inbox, Plus, Calendar, Clock, MoreHorizontal, CheckCircle2, Circle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTasks } from "@/hooks/use-tasks"
import { useCategories } from "@/hooks/use-categories"
import { TaskDialog } from "./task-dialog"
import { format } from "date-fns"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function TaskInbox() {
  const { inboxTasks, loading, toggleTaskCompletion, scheduleInboxTask, deleteTask } = useTasks()
  const { categories } = useCategories()
  const [showTaskDialog, setShowTaskDialog] = useState(false)

  const handleScheduleTask = async (taskId: string, dayOfWeek: number) => {
    try {
      await scheduleInboxTask(taskId, dayOfWeek)
    } catch (error) {
      console.error("Failed to schedule task:", error)
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId)
    } catch (error) {
      console.error("Failed to toggle task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return null
    return categories.find((cat) => cat.id === categoryId)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Task Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-gray-600" />
              Task Inbox
              {inboxTasks.length > 0 && <Badge variant="secondary">{inboxTasks.length}</Badge>}
            </CardTitle>
            <Button size="sm" onClick={() => setShowTaskDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inboxTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No tasks in inbox</p>
              <p className="text-xs text-gray-400 mt-1">Add new tasks or unscheduled items will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {inboxTasks.map((task) => {
                  const category = getCategoryInfo(task.category_id)

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4
                              className={`font-medium text-sm ${
                                task.completed ? "line-through text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {category && (
                                <Badge variant="secondary" className={`text-xs ${category.color} text-white`}>
                                  {category.emoji} {category.name}
                                </Badge>
                              )}
                              {task.priority !== "medium" && (
                                <Badge
                                  variant={task.priority === "high" ? "destructive" : "outline"}
                                  className="text-xs"
                                >
                                  {task.priority}
                                </Badge>
                              )}
                              {task.deadline && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(task.deadline), "MMM d")}
                                </div>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleComplete(task.id)}>
                                {task.completed ? "Mark Incomplete" : "Mark Complete"}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <div className="cursor-pointer">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule for...
                                </div>
                              </DropdownMenuItem>
                              {DAYS.map((day, index) => (
                                <DropdownMenuItem
                                  key={day}
                                  onClick={() => handleScheduleTask(task.id, index)}
                                  className="pl-8"
                                >
                                  {day}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onTaskCreated={() => setShowTaskDialog(false)}
      />
    </>
  )
}
