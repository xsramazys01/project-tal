"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { MobileQuickAdd } from "@/components/mobile/mobile-quick-add"
import { MobileTaskDialog } from "@/components/mobile/mobile-task-dialog"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { MobileTodayView } from "@/components/mobile/mobile-today-view"
import { MobileWeekView } from "@/components/mobile/mobile-week-view"
import { MobileProfileView } from "@/components/mobile/mobile-profile-view"

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
  location?: string
}

const CATEGORIES = [
  { name: "Work", color: "bg-blue-500", emoji: "💼" },
  { name: "Personal", color: "bg-green-500", emoji: "🏠" },
  { name: "Health", color: "bg-red-500", emoji: "💪" },
  { name: "Learning", color: "bg-purple-500", emoji: "📚" },
  { name: "Finance", color: "bg-yellow-500", emoji: "💰" },
]

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("today")
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the Q1 project proposal for client review",
      category: "Work",
      priority: "high",
      deadline: "2024-01-15T17:00",
      completed: false,
      estimatedTime: 3,
      dayOfWeek: 1,
      createdAt: "2024-01-14T10:00",
      location: "Office",
    },
    {
      id: "2",
      title: "Morning workout",
      category: "Health",
      priority: "medium",
      deadline: "2024-01-15T08:00",
      completed: true,
      estimatedTime: 1,
      dayOfWeek: 1,
      createdAt: "2024-01-14T08:00",
      completedAt: "2024-01-15T08:30",
      location: "Gym",
    },
    {
      id: "3",
      title: "Buy groceries",
      category: "Personal",
      priority: "medium",
      deadline: "2024-01-15T19:00",
      completed: false,
      estimatedTime: 1,
      dayOfWeek: 1,
      createdAt: "2024-01-15T09:00",
      location: "Supermarket",
    },
    {
      id: "4",
      title: "Read 30 pages",
      category: "Learning",
      priority: "low",
      deadline: "2024-01-16T22:00",
      completed: false,
      estimatedTime: 1,
      dayOfWeek: 2,
      createdAt: "2024-01-14T12:00",
    },
  ])

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const todayTasks = tasks.filter((task) => {
    const today = new Date().getDay()
    return task.dayOfWeek === today
  })

  const completedTodayTasks = todayTasks.filter((task) => task.completed).length
  const todayProgress = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0

  const upcomingTasks = tasks
    .filter((task) => !task.completed && new Date(task.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3)

  const overdueTasks = tasks.filter((task) => !task.completed && new Date(task.deadline) < new Date())

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative">
      {/* Mobile Header */}
      <MobileHeader currentTime={currentTime} />

      {/* Main Content */}
      <div className="px-4 pt-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="today" className="mt-0">
            <MobileTodayView
              tasks={todayTasks}
              todayProgress={todayProgress}
              upcomingTasks={upcomingTasks}
              overdueTasks={overdueTasks}
              onToggleComplete={toggleTaskComplete}
              onEditTask={(task) => {
                setEditingTask(task)
                setIsTaskDialogOpen(true)
              }}
              onDeleteTask={deleteTask}
              categories={CATEGORIES}
            />
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <MobileWeekView
              tasks={tasks}
              onToggleComplete={toggleTaskComplete}
              onEditTask={(task) => {
                setEditingTask(task)
                setIsTaskDialogOpen(true)
              }}
              onDeleteTask={deleteTask}
              categories={CATEGORIES}
            />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <MobileProfileView tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-40"
        onClick={() => setIsQuickAddOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Quick Add Modal */}
      <MobileQuickAdd
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onSave={(taskData) => {
          addTask(taskData)
          setIsQuickAddOpen(false)
        }}
        categories={CATEGORIES}
      />

      {/* Task Dialog */}
      <MobileTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSave={(taskData) => {
          if (editingTask) {
            updateTask(editingTask.id, taskData)
            setEditingTask(null)
          } else {
            addTask(taskData)
          }
          setIsTaskDialogOpen(false)
        }}
        editingTask={editingTask}
        categories={CATEGORIES}
      />
    </div>
  )
}
