"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, Calendar, MoreHorizontal, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: "low" | "medium" | "high"
  deadline: string | null
  day_of_week: number | null
  estimated_time: number | null
  is_scheduled: boolean
  created_at: string
  category_id: string | null
  categories?: {
    name: string
    color: string
    emoji: string
  }
}

interface TaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  showScheduleButton?: boolean
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

const priorityLabels = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
}

export function TaskCard({ task, onUpdate, onDelete, showScheduleButton = true }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(task.id, { completed: !task.completed })
    } finally {
      setIsUpdating(false)
    }
  }

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hari ini"
    if (diffDays === 1) return "Besok"
    if (diffDays === -1) return "Kemarin"
    if (diffDays < 0) return `${Math.abs(diffDays)} hari yang lalu`
    if (diffDays <= 7) return `${diffDays} hari lagi`

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        task.completed && "opacity-75",
        isOverdue && "border-red-200 bg-red-50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              disabled={isUpdating}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn("font-medium text-gray-900 mb-1", task.completed && "line-through text-gray-500")}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className={cn("text-sm text-gray-600 mb-2", task.completed && "line-through")}>
                    {task.description}
                  </p>
                )}

                {/* Badges and Info */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Priority Badge */}
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>

                  {/* Category Badge */}
                  {task.categories && (
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${task.categories.color}20`,
                        borderColor: task.categories.color,
                        color: task.categories.color,
                      }}
                    >
                      {task.categories.emoji} {task.categories.name}
                    </Badge>
                  )}

                  {/* Overdue Badge */}
                  {isOverdue && (
                    <Badge variant="destructive" className="animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Terlambat
                    </Badge>
                  )}

                  {/* Completed Badge */}
                  {task.completed && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selesai
                    </Badge>
                  )}
                </div>

                {/* Task Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {task.deadline && (
                    <div className={cn("flex items-center", isOverdue && "text-red-600 font-medium")}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDeadline(task.deadline)}
                    </div>
                  )}

                  {task.estimated_time && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimated_time} menit
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdate(task.id, { completed: !task.completed })}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {task.completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tugas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Tugas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
