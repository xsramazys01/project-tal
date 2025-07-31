"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Plus, Clock, MoreHorizontal, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
}

interface CalendarWeekViewProps {
  tasks: Task[]
  currentWeek: Date
  onNavigateWeek: (direction: "prev" | "next") => void
  onAddTask: (dayIndex?: number, timeSlot?: string) => void
  onEditTask: (task: Task) => void
  onToggleComplete: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  categories: Array<{ name: string; color: string }>
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_SLOTS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
]

export function CalendarWeekView({
  tasks,
  currentWeek,
  onNavigateWeek,
  onAddTask,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  categories,
}: CalendarWeekViewProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    const startMonth = start.toLocaleDateString("en-US", { month: "short" })
    const endMonth = end.toLocaleDateString("en-US", { month: "short" })

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
  }

  const getTasksForDay = (dayIndex: number) => {
    return tasks.filter((task) => task.dayOfWeek === dayIndex)
  }

  const getTaskTimeSlot = (task: Task) => {
    if (!task.deadline) return "all-day"
    const time = new Date(task.deadline).toTimeString().slice(0, 5)
    return time
  }

  const getTasksForTimeSlot = (dayIndex: number, timeSlot: string) => {
    const dayTasks = getTasksForDay(dayIndex)
    if (timeSlot === "all-day") {
      return dayTasks.filter((task) => !task.deadline || getTaskTimeSlot(task) === "all-day")
    }
    return dayTasks.filter((task) => {
      const taskTime = getTaskTimeSlot(task)
      const slotHour = Number.parseInt(timeSlot.split(":")[0])
      const taskHour = Number.parseInt(taskTime.split(":")[0])
      return taskHour === slotHour
    })
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.color || "bg-gray-500"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const totalMinutes = hours * 60 + minutes
    const startHour = 6 // 06:00
    const hourHeight = 60 // 60px per hour

    if (totalMinutes < startHour * 60) return 0

    const position = ((totalMinutes - startHour * 60) / 60) * hourHeight
    return Math.max(0, position)
  }

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollAreaRef.current) {
      const currentTimePosition = getCurrentTimePosition()
      scrollAreaRef.current.scrollTop = Math.max(0, currentTimePosition - 200)
    }
  }, [])

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dayIndex: number, timeSlot: string) => {
    e.preventDefault()
    if (draggedTask) {
      // Update task with new day and time
      const newDeadline = new Date(draggedTask.deadline)
      const [hours, minutes] = timeSlot.split(":").map(Number)
      const targetDate = weekDates[dayIndex]

      newDeadline.setFullYear(targetDate.getFullYear())
      newDeadline.setMonth(targetDate.getMonth())
      newDeadline.setDate(targetDate.getDate())
      newDeadline.setHours(hours, minutes)

      onEditTask({
        ...draggedTask,
        dayOfWeek: dayIndex,
        deadline: newDeadline.toISOString(),
      })

      setDraggedTask(null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onNavigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigateWeek("next")}>
              Today
            </Button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{formatWeekRange()}</h2>
        </div>

        <Button onClick={() => onAddTask()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
        <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200">GMT+7</div>
        {weekDates.map((date, index) => (
          <div key={index} className={`p-3 text-center border-r border-gray-200 ${isToday(date) ? "bg-blue-50" : ""}`}>
            <div className="text-xs font-medium text-gray-500 uppercase">{DAYS_OF_WEEK[index]}</div>
            <div className={`text-lg font-semibold mt-1 ${isToday(date) ? "text-blue-600" : "text-gray-900"}`}>
              {date.getDate()}
            </div>
            {isToday(date) && (
              <div className="w-6 h-6 bg-blue-600 rounded-full mx-auto mt-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All Day Events */}
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-25 min-h-[60px]">
        <div className="p-2 text-xs text-gray-500 border-r border-gray-200 flex items-center">All day</div>
        {weekDates.map((date, dayIndex) => (
          <div
            key={dayIndex}
            className="p-2 border-r border-gray-200 min-h-[60px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dayIndex, "all-day")}
          >
            <div className="space-y-1">
              {getTasksForTimeSlot(dayIndex, "all-day").map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${
                    task.completed ? "opacity-60" : ""
                  } ${getCategoryColor(task.category)} text-white`}
                  onClick={() => onEditTask(task)}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{task.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto w-4 hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleComplete(task.id)
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <Circle className="h-3 w-3 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="relative">
          {/* Current Time Line */}
          {weekDates.some((date) => isToday(date)) && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              <div className="flex items-center">
                <div className="w-16 text-right pr-2">
                  <span className="text-xs font-medium text-red-500 bg-white px-1">
                    {new Date().toTimeString().slice(0, 5)}
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
              </div>
            </div>
          )}

          {/* Time Slots */}
          {TIME_SLOTS.map((timeSlot, timeIndex) => (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 h-15">
              {/* Time Label */}
              <div className="p-2 text-xs text-gray-500 border-r border-gray-200 text-right pr-4">{timeSlot}</div>

              {/* Day Columns */}
              {weekDates.map((date, dayIndex) => (
                <div
                  key={`${dayIndex}-${timeSlot}`}
                  className={`border-r border-gray-200 p-1 min-h-[60px] hover:bg-gray-50 cursor-pointer relative ${
                    isToday(date) ? "bg-blue-25" : ""
                  }`}
                  onClick={() => onAddTask(dayIndex, timeSlot)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dayIndex, timeSlot)}
                >
                  <div className="space-y-1">
                    {getTasksForTimeSlot(dayIndex, timeSlot).map((task) => {
                      const isOverdue = new Date(task.deadline) < new Date() && !task.completed

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          className={`p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-all border-l-4 bg-white ${getPriorityColor(
                            task.priority,
                          )} ${task.completed ? "opacity-60" : ""} ${isOverdue ? "ring-1 ring-red-300" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTask(task)
                          }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center space-x-1 flex-1 min-w-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto w-3"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleComplete(task.id)
                                }}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Circle className="h-3 w-3 text-gray-400" />
                                )}
                              </Button>
                              <span
                                className={`font-medium truncate ${
                                  task.completed ? "line-through text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {task.title}
                              </span>
                              {isOverdue && <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 h-auto w-4 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEditTask(task)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                              <span className="text-gray-500">{task.category}</span>
                            </div>

                            {task.estimatedTime && (
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{task.estimatedTime}h</span>
                              </div>
                            )}
                          </div>

                          {task.description && (
                            <div className="text-gray-500 mt-1 text-xs truncate">{task.description}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
