"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, Calendar } from "lucide-react"

interface Task {
  title: string
  description?: string
  category: string
  priority: "high" | "medium" | "low"
  deadline: string
  estimatedTime?: number
  dayOfWeek: number
  location?: string
}

interface MobileQuickAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => void
  categories: Array<{ name: string; color: string; emoji: string }>
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MobileQuickAdd({ open, onOpenChange, onSave, categories }: MobileQuickAddProps) {
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

  const [step, setStep] = useState(1)

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

    // Reset form
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
    setStep(1)
  }

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const quickTemplates = [
    { title: "Call someone", category: "Personal", emoji: "📞" },
    { title: "Buy groceries", category: "Personal", emoji: "🛒" },
    { title: "Workout", category: "Health", emoji: "💪" },
    { title: "Read book", category: "Learning", emoji: "📚" },
    { title: "Team meeting", category: "Work", emoji: "👥" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Add a new task to your list</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            {/* Quick Templates */}
            <div>
              <Label className="text-sm font-medium">Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {quickTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3 bg-transparent"
                    onClick={() => {
                      updateFormData("title", template.title)
                      updateFormData("category", template.category)
                    }}
                  >
                    <span className="mr-2">{template.emoji}</span>
                    <span className="text-xs">{template.title}</span>
                  </Button>
                ))}
              </div>
            </div>

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

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={!formData.title.trim()} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Add Task
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
