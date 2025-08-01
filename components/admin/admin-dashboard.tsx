"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Users, CheckCircle, TrendingUp, Calendar, Activity, UserPlus, Target, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  completedTasks: number
  completionRate: number
  newUsersThisWeek: number
  tasksCompletedToday: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)

      // Get total users
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Get active users (users with tasks in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: activeUsersData } = await supabase
        .from("tasks")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo.toISOString())

      const activeUsers = new Set(activeUsersData?.map((task) => task.user_id) || []).size

      // Get total tasks
      const { count: totalTasks } = await supabase.from("tasks").select("*", { count: "exact", head: true })

      // Get completed tasks
      const { count: completedTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)

      // Get new users this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: newUsersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())

      // Get tasks completed today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: tasksCompletedToday } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)
        .gte("updated_at", today.toISOString())

      const completionRate = totalTasks && totalTasks > 0 ? (completedTasks! / totalTasks) * 100 : 0

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        completionRate,
        newUsersThisWeek: newUsersThisWeek || 0,
        tasksCompletedToday: tasksCompletedToday || 0,
      })
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      toast.error("Gagal memuat statistik admin")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Dashboard
          </CardTitle>
          <CardDescription>Gagal memuat data statistik admin</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAdminStats} variant="outline">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsersThisWeek} minggu ini</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.tasksCompletedToday} selesai hari ini</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.completedTasks.toLocaleString()} tugas selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>Status dan performa sistem saat ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sehat</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autentikasi</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Respons API</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cepat</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Penyimpanan</span>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Normal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Tugas administratif umum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 bg-transparent"
              onClick={() => toast.info("Fitur akan segera tersedia")}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Buat Admin Baru</div>
                  <div className="text-sm text-gray-600">Tambahkan administrator baru</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 bg-transparent"
              onClick={() => toast.info("Fitur akan segera tersedia")}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Lihat Analitik</div>
                  <div className="text-sm text-gray-600">Analitik sistem terperinci</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 bg-transparent"
              onClick={() => toast.info("Fitur akan segera tersedia")}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Pemeliharaan Sistem</div>
                  <div className="text-sm text-gray-600">Jadwalkan tugas pemeliharaan</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Aktivitas</CardTitle>
          <CardDescription>Aktivitas sistem terbaru dan tren</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.newUsersThisWeek}</div>
              <div className="text-sm text-gray-600">Pengguna Baru Minggu Ini</div>
            </div>
            <div className="text-center p-6 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.tasksCompletedToday}</div>
              <div className="text-sm text-gray-600">Tugas Selesai Hari Ini</div>
            </div>
            <div className="text-center p-6 border rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-gray-600">Tingkat Keterlibatan Pengguna</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
