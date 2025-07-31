"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, CheckCircle2, Circle, X, Edit2 } from "lucide-react"
import { weeklyFocusService } from "@/lib/database"
import type { WeeklyFocusGoal } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function WeeklyFocus() {
  const [goals, setGoals] = useState<WeeklyFocusGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [newGoal, setNewGoal] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const { toast } = useToast()

  // Get current week start date
  const getWeekStartDate = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  const loadGoals = async () => {
    try {
      setLoading(true)
      const weekStart = getWeekStartDate()
      const data = await weeklyFocusService.getWeeklyGoals(weekStart)
      setGoals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load weekly goals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return

    try {
      const weekStart = getWeekStartDate()
      const goal = await weeklyFocusService.createWeeklyGoal({
        title: newGoal.trim(),
        week_start_date: weekStart.toISOString().split("T")[0],
      })

      setGoals((prev) => [...prev, goal])
      setNewGoal("")
      setIsAdding(false)

      toast({
        title: "Goal Added",
        description: "Weekly focus goal has been added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      })
    }
  }

  const handleToggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const updatedGoal = await weeklyFocusService.updateWeeklyGoal(goalId, {
        completed: !completed,
      })

      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updatedGoal : goal)))

      toast({
        title: completed ? "Goal Unmarked" : "Goal Completed",
        description: completed ? "Goal marked as incomplete" : "Congratulations on completing your goal!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      })
    }
  }

  const handleEditGoal = async (goalId: string) => {
    if (!editingText.trim()) return

    try {
      const updatedGoal = await weeklyFocusService.updateWeeklyGoal(goalId, {
        title: editingText.trim(),
      })

      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updatedGoal : goal)))

      setEditingId(null)
      setEditingText("")

      toast({
        title: "Goal Updated",
        description: "Goal has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await weeklyFocusService.deleteWeeklyGoal(goalId)
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))

      toast({
        title: "Goal Deleted",
        description: "Goal has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      })
    }
  }

  const startEditing = (goal: WeeklyFocusGoal) => {
    setEditingId(goal.id)
    setEditingText(goal.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingText("")
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const completedGoals = goals.filter((goal) => goal.completed).length
  const totalGoals = goals.length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Weekly Focus
            {totalGoals > 0 && (
              <Badge variant={completedGoals === totalGoals ? "default" : "secondary"}>
                {completedGoals}/{totalGoals}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={() => setIsAdding(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new goal */}
        {isAdding && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter your weekly focus goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleAddGoal}>
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewGoal("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Goals list */}
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No weekly goals set</p>
            <p className="text-xs text-gray-400 mt-1">Add 3-5 key objectives to focus on this week</p>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => handleToggleGoal(goal.id, goal.completed)}
                  className="text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <div className="flex-1">
                  {editingId === goal.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEditGoal(goal.id)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleEditGoal(goal.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className={`text-sm ${goal.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {goal.title}
                    </span>
                  )}
                </div>

                {editingId !== goal.id && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(goal)} className="h-8 w-8 p-0">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress summary */}
        {totalGoals > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Weekly Progress</span>
              <span className="font-medium">{Math.round((completedGoals / totalGoals) * 100)}% Complete</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
