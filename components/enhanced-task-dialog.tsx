"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Tag, Flag } from "lucide-react"

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

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Omit<Task, "id" | "completed">) => void
  editingTask?: Task | null
  categories: Array<{ name: string; color: string }>
  weekDates: Date[]
  preselectedDay?: number
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function EnhancedTaskDialog({
  open,
  onOpenChange,
  onSave,
  editingTask,
  categories,
  weekDates,
  preselectedDay,
}: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "high" | "medium" | "low",
    deadline: "",
    estimatedTime: "",
    dayOfWeek: preselectedDay ?? new Date().getDay(),
  })

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        category: editingTask.category,
        priority: editingTask.priority,
        deadline: editingTask.deadline,
        estimatedTime: editingTask.estimatedTime?.toString() || "",
        dayOfWeek: editingTask.dayOfWeek,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        deadline: "",
        estimatedTime: "",
        dayOfWeek: preselectedDay ?? new Date().getDay(),
      })
    }
  }, [editingTask, open, preselectedDay])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      priority: formData.priority,
      deadline: formData.deadline,
      estimatedTime: formData.estimatedTime ? Number.parseInt(formData.estimatedTime) : undefined,
      dayOfWeek: formData.dayOfWeek,
    })
  }

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-700"
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-700"
      case "low":
        return "border-green-200 bg-green-50 text-green-700"
      default:
        return "border-gray-200 bg-gray-50 text-gray-700"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {editingTask ? "Update your task details below" : "Add a new task to your weekly schedule"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Task Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Complete project proposal"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              className="text-base"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details about this task..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center">
                <Flag className="h-4 w-4 mr-1" />
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                      <span className="font-medium">High Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                      <span className="font-medium">Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      <span className="font-medium">Low Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Day Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule for Day
            </Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => updateFormData("dayOfWeek", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => {
                  const date = weekDates[index]
                  const isToday = date?.toDateString() === new Date().toDateString()
                  return (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{day}</span>
                        <div className="flex items-center ml-4">
                          <span className="text-sm text-gray-500">
                            {date?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          {isToday && <span className="text-emerald-600 ml-2 text-xs font-medium">(Today)</span>}
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-semibold text-gray-700 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Deadline (Optional)
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => updateFormData("deadline", e.target.value)}
              />
            </div>

            {/* Estimated Time */}
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="text-sm font-semibold text-gray-700">
                Estimated Time (hours)
              </Label>
              <Input
                id="estimatedTime"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g., 2"
                value={formData.estimatedTime}
                onChange={(e) => updateFormData("estimatedTime", e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Task Preview:</h4>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{formData.title}</div>
                {formData.description && <div className="text-sm text-gray-600">{formData.description}</div>}
                <div className="flex items-center space-x-3 text-xs">
                  {formData.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">{formData.category}</span>
                  )}
                  <span className={`px-2 py-1 rounded font-medium ${getPriorityColor(formData.priority)}`}>
                    {formData.priority.toUpperCase()}
                  </span>
                  <span className="text-gray-500">{DAYS_OF_WEEK[formData.dayOfWeek]}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
              disabled={!formData.title.trim()}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
