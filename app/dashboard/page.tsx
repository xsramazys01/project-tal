"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  Target,
  User,
  BarChart3,
  AlertCircle,
  FileText,
  Users,
  CalendarDays,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TaskDialog } from "@/components/task-dialog"
import { toast } from "sonner"

interface DashboardStats {
  daily: {
    total: number
    done: number
    pending: number
    status: "not_reported" | "reported" | "late_report"
  }
  weekly: {
    total: number
    done: number
    pending: number
    status: "not_reported" | "reported" | "late_report"
  }
  monthly: {
    total: number
    done: number
    pending: number
    status: "not_reported" | "reported" | "late_report"
  }
}

interface UserProfile {
  id: string
  username: string
  full_name: string
  user_type: string
  position: string
  division: string
  branch: string
  email: string
  avatar_url?: string
}

interface Notification {
  id: string
  type: "deadline" | "holiday" | "report"
  title: string
  message: string
  priority: "high" | "medium" | "low"
  date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    daily: { total: 0, done: 0, pending: 0, status: "not_reported" },
    weekly: { total: 0, done: 0, pending: 0, status: "not_reported" },
    monthly: { total: 0, done: 0, pending: 0, status: "not_reported" },
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      // Get user profile
      await loadUserProfile(user.id)

      // Load dashboard statistics
      await loadDashboardStats(user.id)

      // Load notifications
      await loadNotifications(user.id)
    } catch (error: any) {
      console.error("Dashboard error:", error)
      setError(error.message || "Gagal memuat data dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      // First try to get from user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      if (userProfile) {
        setProfile({
          ...userProfile,
          email: userProfile.email || "",
        })
      } else {
        // Fallback to auth user data
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setProfile({
            id: user.id,
            username: user.email?.split("@")[0] || "user",
            full_name: user.user_metadata?.full_name || user.email || "User",
            user_type: "employee",
            position: "Staff",
            division: "General",
            branch: "Head Office",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url,
          })
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const loadDashboardStats = async (userId: string) => {
    try {
      const today = new Date()
      const currentWeekStart = getWeekStart(today)
      const currentMonth = today.toISOString().slice(0, 7) // YYYY-MM

      // Load daily tasks for today
      const { data: dailyTasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", userId)
        .eq("task_type", "daily")
        .eq("task_date", today.toISOString().split("T")[0])

      // Load weekly tasks for current week
      const { data: weeklyTasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", userId)
        .eq("task_type", "weekly")
        .eq("week_start_date", currentWeekStart.toISOString().split("T")[0])

      // Load monthly tasks for current month
      const { data: monthlyTasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", userId)
        .eq("task_type", "monthly")
        .eq("month_year", currentMonth)

      // Calculate stats
      const calculateStats = (tasks: any[]) => {
        const total = tasks?.length || 0
        const done = tasks?.filter((t) => t.status === "done").length || 0
        const pending = total - done
        return { total, done, pending }
      }

      setStats({
        daily: {
          ...calculateStats(dailyTasks),
          status: "not_reported", // This would be calculated based on report status
        },
        weekly: {
          ...calculateStats(weeklyTasks),
          status: "not_reported",
        },
        monthly: {
          ...calculateStats(monthlyTasks),
          status: "not_reported",
        },
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const loadNotifications = async (userId: string) => {
    // Mock notifications - in real app, this would come from database
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "deadline",
        title: "Deadline Locking Rencana Harian",
        message: "Rencana kerja harian minggu ini akan dikunci dalam 2 jam",
        priority: "high",
        date: new Date().toISOString(),
      },
      {
        id: "2",
        type: "report",
        title: "Laporan Harian Belum Disubmit",
        message: "Anda belum melaporkan aktivitas hari kemarin",
        priority: "medium",
        date: new Date().toISOString(),
      },
      {
        id: "3",
        type: "holiday",
        title: "Hari Libur Nasional",
        message: "Besok adalah hari libur nasional - Hari Kemerdekaan RI",
        priority: "low",
        date: new Date().toISOString(),
      },
    ]

    setNotifications(mockNotifications)
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/login")
    } catch (error: any) {
      console.error("Logout error:", error)
      toast.error("Gagal logout")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reported":
        return <Badge className="bg-green-100 text-green-800">Sudah Laporkan</Badge>
      case "late_report":
        return <Badge className="bg-red-100 text-red-800">Terlambat Laporkan</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Belum Laporkan</Badge>
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "report":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "holiday":
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-white rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white rounded-lg"></div>
              <div className="h-96 bg-white rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TAL</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard TAL</h1>
              <p className="text-sm text-gray-600">Selamat datang, {profile?.full_name || "User"}! 👋</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2">
                  <h3 className="font-semibold mb-2">Notifikasi</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-2 border rounded-lg">
                          <div className="flex items-start space-x-2">
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs text-gray-600">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{profile?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/my-profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/setting-tal")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Task Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <span>Tugas Harian</span>
              </CardTitle>
              <CardDescription>Status tugas hari ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{stats.daily.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="font-semibold text-green-600">{stats.daily.done}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">{stats.daily.pending}</span>
                </div>
                <div className="pt-2 border-t">{getStatusBadge(stats.daily.status)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Tugas Mingguan</span>
              </CardTitle>
              <CardDescription>Status tugas minggu ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{stats.weekly.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="font-semibold text-green-600">{stats.weekly.done}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">{stats.weekly.pending}</span>
                </div>
                <div className="pt-2 border-t">{getStatusBadge(stats.weekly.status)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Tugas Bulanan</span>
              </CardTitle>
              <CardDescription>Status tugas bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{stats.monthly.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="font-semibold text-green-600">{stats.monthly.done}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">{stats.monthly.pending}</span>
                </div>
                <div className="pt-2 border-t">{getStatusBadge(stats.monthly.status)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Akses cepat ke fitur utama</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 bg-transparent"
                    onClick={() => router.push("/tasks?type=daily")}
                  >
                    <CalendarDays className="h-6 w-6 text-blue-600" />
                    <span className="text-xs">Rencana Harian</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 bg-transparent"
                    onClick={() => router.push("/tasks?type=weekly")}
                  >
                    <Calendar className="h-6 w-6 text-green-600" />
                    <span className="text-xs">Rencana Mingguan</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 bg-transparent"
                    onClick={() => router.push("/my-report")}
                  >
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span className="text-xs">Laporan Saya</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 bg-transparent"
                    onClick={() => router.push("/tasks")}
                  >
                    <Target className="h-6 w-6 text-orange-600" />
                    <span className="text-xs">Semua Tugas</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Progress Kinerja (Nilai TAL)</span>
                </CardTitle>
                <CardDescription>Grafik progress nilai TAL mingguan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Grafik TAL akan ditampilkan di sini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Kalender</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">{new Date().getDate()}</p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Menu Navigasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/tasks")}>
                  <Target className="h-4 w-4 mr-2" />
                  Kelola Tugas
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/my-report")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Laporan Saya
                </Button>
                {(profile?.user_type === "admin" ||
                  profile?.user_type === "hr" ||
                  profile?.user_type === "auditor") && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/all-report")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Semua Laporan
                  </Button>
                )}
                {(profile?.user_type === "admin" || profile?.user_type === "hr") && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/users-list")}>
                    <Users className="h-4 w-4 mr-2" />
                    Daftar Pengguna
                  </Button>
                )}
                {profile?.user_type === "admin" && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/setting-tal")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan TAL
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Info Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Rencana Harian</p>
                    <p className="text-blue-600">Harus dikunci maksimal H+2 dari hari kerja pertama minggu ini</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">Laporan</p>
                    <p className="text-green-600">Tombol laporan aktif jika semua task memiliki status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        onTaskCreated={() => {
          loadDashboardData()
          toast.success("Tugas berhasil dibuat!")
        }}
      />
    </div>
  )
}
