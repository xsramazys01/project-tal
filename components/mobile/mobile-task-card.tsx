"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, MapPin, MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react"
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
  location?: string
}

interface MobileTaskCardProps {
  task: Task
  onToggleComplete: () => void
  onEdit: () => void
  onDelete: () => void
  categories: Array<{ name: string; color: string; emoji: string }>
}

export function MobileTaskCard({ task, onToggleComplete, onEdit, onDelete, categories }: MobileTaskCardProps) {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false)
  const category = categories.find((cat) => cat.name === task.category)
  const isOverdue = new Date(task.deadline) < new Date() && !task.completed

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()

    if (isToday) {
      return `Today ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
    }
    if (isTomorrow) {
      return `Tomorrow ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        task.completed
          ? "bg-gray-50 border-gray-200"
          : isOverdue
            ? "bg-red-50 border-red-200"
            : "bg-white border-gray-200 hover:shadow-md"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Completion Toggle */}
          <Button variant="ghost" size="sm" className="p-0 h-auto mt-1" onClick={onToggleComplete}>
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className={`text-xs mt-1 ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                    {task.description}
                  </p>
                )}
              </div>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Task Meta */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {/* Category */}
              {category && (
                <div className="flex items-center">
                  <span className="text-sm mr-1">{category.emoji}</span>
                  <span className="text-xs text-gray-600">{task.category}</span>
                </div>
              )}

              {/* Priority */}
              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>

              {/* Deadline */}
              {task.deadline && (
                <div className={`flex items-center text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                  {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDeadline(task.deadline)}
                </div>
              )}

              {/* Location */}
              {task.location && (
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {task.location}
                </div>
              )}

              {/* Estimated Time */}
              {task.estimatedTime && (
                <Badge variant="secondary" className="text-xs">
                  {task.estimatedTime}h
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
