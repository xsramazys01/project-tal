"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Clock, Calendar } from "lucide-react"

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
  location?: string
}

interface MobileTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
  editingTask?: Task | null
  categories: Array<{ name: string; color: string; emoji: string }>
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MobileTaskDialog({ open, onOpenChange, onSave, editingTask, categories }: MobileTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as "high" | "medium" | "low",
    deadline: "",
    estimatedTime: "",
    dayOfWeek: new Date().getDay(),
    location: "",
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
        location: editingTask.location || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        deadline: "",
        estimatedTime: "",
        dayOfWeek: new Date().getDay(),
        location: "",
      })
    }
  }, [editingTask, open])

  const handleSubmit = () => {
    if (!formData.title.trim()) return

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      priority: formData.priority,
      deadline: formData.deadline,
      estimatedTime: formData.estimatedTime ? Number.parseInt(formData.estimatedTime) : undefined,
      dayOfWeek: formData.dayOfWeek,
      location: formData.location.trim() || undefined,
    })
  }

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>{editingTask ? "Update your task details" : "Create a new task"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="What do you need to do?"
              value={formData.title}
              onChange={(e) => updateFormData("title", e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={formData.category === category.name ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => updateFormData("category", category.name)}
                >
                  <span className="mr-2">{category.emoji}</span>
                  <span className="text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {["high", "medium", "low"].map((priority) => (
                <Button
                  key={priority}
                  variant={formData.priority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFormData("priority", priority)}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* Day */}
          <div className="space-y-2">
            <Label>Day</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => updateFormData("dayOfWeek", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {day}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => updateFormData("deadline", e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="Where will you do this?"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="estimatedTime"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="How long will this take?"
                value={formData.estimatedTime}
                onChange={(e) => updateFormData("estimatedTime", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2">
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {editingTask ? "Update Task" : "Add Task"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
