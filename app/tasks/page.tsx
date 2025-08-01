"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskDialog } from "@/components/task-dialog"
import { TaskCard } from "@/components/task-card"
import { TaskInbox } from "@/components/task-inbox"
import { Plus, Search, Filter, Calendar, CheckCircle, Clock, Target, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/use-categories"

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

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { categories } = useCategories()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, filterPriority, filterCategory, filterStatus])

  const checkUserAndLoadTasks = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      setUser(user)
      await loadTasks(user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    }
  }

  const loadTasks = async (userId: string) => {
    try {
      setLoading(true)

      const { data: allTasks, error } = await supabase
        .from("tasks")
        .select(`
          *,
          categories(name, color, emoji)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const scheduledTasks = allTasks?.filter((task) => task.is_scheduled) || []
      const unscheduledTasks = allTasks?.filter((task) => !task.is_scheduled) || []

      setTasks(scheduledTasks)
      setInboxTasks(unscheduledTasks)
    } catch (error: any) {
      console.error("Error loading tasks:", error)
      toast({
        title: "Error",
        description: "Gagal memuat tugas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((task) => task.category_id === filterCategory)
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "completed") {
        filtered = filtered.filter((task) => task.completed)
      } else if (filterStatus === "pending") {
        filtered = filtered.filter((task) => !task.completed)
      } else if (filterStatus === "overdue") {
        const now = new Date()
        filtered = filtered.filter((task) => !task.completed && task.deadline && new Date(task.deadline) < now)
      }
    }

    setFilteredTasks(filtered)
  }

  const handleTaskCreated = () => {
    setShowTaskDialog(false)
    if (user) {
      loadTasks(user.id)
    }
    toast({
      title: "Tugas Berhasil Dibuat",
      description: "Tugas baru telah ditambahkan",
    })
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase.from("tasks").update(updates).eq("id", taskId)

      if (error) throw error

      if (user) {
        loadTasks(user.id)
      }

      toast({
        title: "Tugas Diperbarui",
        description: "Perubahan telah disimpan",
      })
    } catch (error: any) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui tugas",
        variant: "destructive",
      })
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      if (user) {
        loadTasks(user.id)
      }

      toast({
        title: "Tugas Dihapus",
        description: "Tugas telah dihapus dari daftar",
      })
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus tugas",
        variant: "destructive",
      })
    }
  }

  const getTasksByDay = (dayIndex: number) => {
    return filteredTasks.filter((task) => task.day_of_week === dayIndex)
  }

  const getStats = () => {
    const total = tasks.length + inboxTasks.length
    const completed = [...tasks, ...inboxTasks].filter((task) => task.completed).length
    const pending = total - completed
    const overdue = [...tasks, ...inboxTasks].filter(
      (task) => !task.completed && task.deadline && new Date(task.deadline) < new Date(),
    ).length

    return { total, completed, pending, overdue }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat tugas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kelola Tugas</h1>
                <p className="text-sm text-gray-600">Atur dan kelola semua tugas Anda</p>
              </div>
            </div>
            <Button onClick={() => setShowTaskDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Tugas Baru
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari tugas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Prioritas</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="low">Rendah</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="overdue">Terlambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Tabs */}
        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduled">Tugas Terjadwal ({tasks.length})</TabsTrigger>
            <TabsTrigger value="inbox">Inbox ({inboxTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-6">
            {DAYS.map((day, index) => {
              const dayTasks = getTasksByDay(index)
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{day}</span>
                      <Badge variant="secondary">{dayTasks.length} tugas</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayTasks.length > 0 ? (
                      <div className="grid gap-4">
                        {dayTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">Tidak ada tugas untuk {day}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="inbox">
            <TaskInbox tasks={inboxTasks} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Dialog */}
      <TaskDialog open={showTaskDialog} onOpenChange={setShowTaskDialog} onTaskCreated={handleTaskCreated} />
    </div>
  )
}
