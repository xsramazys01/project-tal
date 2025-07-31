"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle2, Circle, Clock, MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react"

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
}

interface TaskCardProps {
  task: Task
  onToggleComplete: () => void
  onEdit: (task: Task) => void
  onDelete: () => void
  categories: Array<{ name: string; color: string }>
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, categories }: TaskCardProps) {
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
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        task.completed
          ? "bg-gray-50 border-gray-200 opacity-75"
          : isOverdue
            ? "bg-red-50 border-red-200 shadow-sm"
            : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Button variant="ghost" size="sm" className="p-0 h-auto mt-0.5" onClick={onToggleComplete}>
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-emerald-500" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm font-semibold leading-tight ${
                task.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className={`text-xs mt-1 leading-relaxed ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-2">
              {category && (
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${category.color} mr-1.5`} />
                  <span className="text-xs font-medium text-gray-600">{task.category}</span>
                </div>
              )}

              <Badge variant="outline" className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()}
              </Badge>

              {task.deadline && (
                <div
                  className={`flex items-center text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}
                >
                  {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDeadline(task.deadline)}
                </div>
              )}

              {task.estimatedTime && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {task.estimatedTime}h
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
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
    </div>
  )
}
