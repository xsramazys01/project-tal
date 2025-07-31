"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useTasks } from "@/hooks/use-tasks"
import { useCategories } from "@/hooks/use-categories"
import { useToast } from "@/hooks/use-toast"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: () => void
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export function TaskDialog({ open, onOpenChange, onTaskCreated }: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium" as "low" | "medium" | "high",
    deadline: undefined as Date | undefined,
    day_of_week: null as number | null,
    estimated_time: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { createTask } = useTasks()
  const { categories } = useCategories()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a task title",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id || null,
        priority: formData.priority,
        deadline: formData.deadline?.toISOString() || null,
        day_of_week: formData.day_of_week,
        estimated_time: formData.estimated_time ? Number.parseInt(formData.estimated_time) : null,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        category_id: "",
        priority: "medium",
        deadline: undefined,
        day_of_week: null,
        estimated_time: "",
      })

      toast({
        title: "Task Created",
        description: "Your task has been added successfully",
      })

      onTaskCreated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add task description..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange("category_id", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") => handleInputChange("priority", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Day */}
          <div className="space-y-2">
            <Label>Schedule for Day (Optional)</Label>
            <Select
              value={formData.day_of_week?.toString() || ""}
              onValueChange={(value) => handleInputChange("day_of_week", value ? Number.parseInt(value) : null)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Leave unscheduled (goes to inbox)" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deadline and Estimated Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground",
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => handleInputChange("deadline", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_time">Estimated Hours</Label>
              <Input
                id="estimated_time"
                type="number"
                placeholder="2"
                min="0"
                max="24"
                value={formData.estimated_time}
                onChange={(e) => handleInputChange("estimated_time", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
