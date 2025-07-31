"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, List, BarChart3, Smartphone } from "lucide-react"
import Link from "next/link"
import { QuickStats } from "@/components/quick-stats"
import { WeeklyProgress } from "@/components/weekly-progress"
import { TaskInbox } from "@/components/task-inbox"
import { WeeklyFocus } from "@/components/weekly-focus"
import { RecentActivity } from "@/components/recent-activity"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { TaskDialog } from "@/components/task-dialog"
import { useAuth } from "@/hooks/use-auth"

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

interface WeeklyFocusGoal {
  id: string
  title: string
  completed: boolean
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const CATEGORIES = [
  { name: "Work", color: "bg-blue-500" },
  { name: "Personal", color: "bg-green-500" },
  { name: "Health", color: "bg-red-500" },
  { name: "Learning", color: "bg-purple-500" },
  { name: "Finance", color: "bg-yellow-500" },
]

export default function DashboardPage() {
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finish the Q1 project proposal for client review",
      category: "Work",
      priority: "high",
      deadline: "2025-01-31T14:00",
      completed: false,
      estimatedTime: 3,
      dayOfWeek: 5,
      createdAt: "2025-01-30T10:00",
    },
    {
      id: "2",
      title: "Morning workout",
      category: "Health",
      priority: "medium",
      deadline: "2025-01-31T07:00",
      completed: true,
      estimatedTime: 1,
      dayOfWeek: 5,
      createdAt: "2025-01-30T08:00",
      completedAt: "2025-01-31T08:30",
    },
    {
      id: "3",
      title: "Read 30 pages of book",
      category: "Learning",
      priority: "low",
      deadline: "2025-02-01T20:00",
      completed: false,
      estimatedTime: 1,
      dayOfWeek: 6,
      createdAt: "2025-01-30T12:00",
    },
    {
      id: "4",
      title: "Team meeting",
      description: "Weekly team sync and project updates",
      category: "Work",
      priority: "high",
      deadline: "2025-02-03T10:00",
      completed: false,
      estimatedTime: 2,
      dayOfWeek: 1,
      createdAt: "2025-01-29T15:00",
    },
    {
      id: "5",
      title: "Grocery shopping",
      category: "Personal",
      priority: "medium",
      deadline: "2025-02-01T16:00",
      completed: false,
      estimatedTime: 1,
      dayOfWeek: 6,
      createdAt: "2025-01-28T11:00",
    },
    {
      id: "6",
      title: "Doctor appointment",
      category: "Health",
      priority: "high",
      deadline: "2025-02-04T15:30",
      completed: false,
      estimatedTime: 1,
      dayOfWeek: 2,
      createdAt: "2025-01-30T09:00",
    },
    {
      id: "7",
      title: "Plan vacation",
      description: "Research destinations and book flights",
      category: "Personal",
      priority: "low",
      deadline: "2025-02-02T19:00",
      completed: false,
      estimatedTime: 2,
      dayOfWeek: 0,
      createdAt: "2025-01-29T20:00",
    },
    {
      id: "8",
      title: "Review financial reports",
      description: "Analyze Q4 performance and budget planning",
      category: "Finance",
      priority: "medium",
      deadline: "2025-02-05T11:00",
      completed: false,
      estimatedTime: 3,
      dayOfWeek: 3,
      createdAt: "2025-01-30T14:00",
    },
  ])

  const [inboxTasks, setInboxTasks] = useState<Omit<Task, "dayOfWeek">[]>([
    {
      id: "inbox-1",
      title: "Research new productivity tools",
      category: "Work",
      priority: "low",
      deadline: "",
      completed: false,
      createdAt: "2025-01-29T15:00",
    },
    {
      id: "inbox-2",
      title: "Schedule dentist appointment",
      category: "Health",
      priority: "medium",
      deadline: "",
      completed: false,
      createdAt: "2025-01-28T11:00",
    },
  ])

  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusGoal[]>([
    { id: "focus-1", title: "Complete Q1 project proposal and get client approval", completed: false },
    { id: "focus-2", title: "Establish consistent morning workout routine", completed: true },
    { id: "focus-3", title: "Plan and set clear goals for February 2025", completed: false },
  ])

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
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

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

  const handleCalendarAddTask = (dayIndex?: number, timeSlot?: string) => {
    // Implementation for adding task in calendar view
  }

  const handleCalendarEditTask = (task: Task) => {
    // Implementation for editing task in calendar view
  }

  const getTasksForDay = (dayIndex: number) => {
    // Implementation for filtering tasks by day
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  const getOverdueTasks = () => {
    return tasks.filter((task) => !task.completed && new Date(task.deadline) < new Date())
  }

  const getTodayTasks = () => {
    const today = new Date().getDay()
    return tasks.filter((task) => task.dayOfWeek === today)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.profile?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600">Let's make this week productive and achieve your goals.</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/mobile">
                <Button variant="outline" size="sm">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile View
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Button onClick={() => setShowTaskDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <QuickStats
              tasks={tasks}
              completionPercentage={completionPercentage}
              overdueTasks={getOverdueTasks()}
              todayTasks={getTodayTasks()}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <WeeklyProgress tasks={tasks} weekDates={weekDates} />
                <TaskInbox
                  tasks={inboxTasks}
                  onScheduleTask={(taskId, dayOfWeek) => {
                    const task = inboxTasks.find((t) => t.id === taskId)
                    if (task) {
                      const scheduledTask: Task = {
                        ...task,
                        dayOfWeek,
                        id: Date.now().toString(),
                      }
                      setTasks((prev) => [...prev, scheduledTask])
                      setInboxTasks((prev) => prev.filter((t) => t.id !== taskId))
                    }
                  }}
                  onDeleteTask={(taskId) => {
                    setInboxTasks((prev) => prev.filter((t) => t.id !== taskId))
                  }}
                  categories={CATEGORIES}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <WeeklyFocus
                  goals={weeklyFocus}
                  onUpdateGoal={(id, completed) => {
                    setWeeklyFocus((prev) => prev.map((goal) => (goal.id === id ? { ...goal, completed } : goal)))
                  }}
                  detailed={true}
                />
                <RecentActivity tasks={tasks} />
              </div>
            </div>
          </TabsContent>

          {/* Weekly Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Weekly Focus Goals */}
              <div className="lg:col-span-1">
                <WeeklyFocus
                  goals={weeklyFocus}
                  onUpdateGoal={(id, completed) => {
                    setWeeklyFocus((prev) => prev.map((goal) => (goal.id === id ? { ...goal, completed } : goal)))
                  }}
                  detailed={true}
                />
              </div>

              {/* Weekly Tasks Grid */}
              <div className="lg:col-span-3">
                <CalendarWeekView
                  tasks={tasks}
                  currentWeek={currentWeek}
                  onNavigateWeek={navigateWeek}
                  onAddTask={handleCalendarAddTask}
                  onEditTask={handleCalendarEditTask}
                  onToggleComplete={toggleTaskComplete}
                  onDeleteTask={deleteTask}
                  categories={CATEGORIES}
                />
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <CalendarWeekView
              tasks={tasks}
              currentWeek={currentWeek}
              onNavigateWeek={navigateWeek}
              onAddTask={handleCalendarAddTask}
              onEditTask={handleCalendarEditTask}
              onToggleComplete={toggleTaskComplete}
              onDeleteTask={deleteTask}
              categories={CATEGORIES}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onTaskCreated={() => setShowTaskDialog(false)}
      />
    </div>
  )
}
