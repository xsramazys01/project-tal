"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Search, Ban, Trash2, UserCheck, Users } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: string
  suspended: boolean
  created_at: string
  taskCount?: number
  completedTaskCount?: number
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      let query = supabase.from("profiles").select("*", { count: "exact" })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get task counts for each user
      const usersWithStats = await Promise.all(
        (data || []).map(async (user) => {
          const { count: taskCount } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          const { count: completedTaskCount } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", true)

          return {
            ...user,
            taskCount: taskCount || 0,
            completedTaskCount: completedTaskCount || 0,
          }
        }),
      )

      setUsers(usersWithStats)
      setTotal(count || 0)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Gagal memuat data pengguna")
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      toast.success("Role pengguna berhasil diperbarui")
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Gagal memperbarui role pengguna")
    }
  }

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ suspended: true }).eq("id", userId)

      if (error) throw error

      toast.success("Pengguna berhasil disuspend")
      fetchUsers()
    } catch (error) {
      console.error("Error suspending user:", error)
      toast.error("Gagal suspend pengguna")
    }
  }

  const unsuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ suspended: false }).eq("id", userId)

      if (error) throw error

      toast.success("Pengguna berhasil diaktifkan kembali")
      fetchUsers()
    } catch (error) {
      console.error("Error unsuspending user:", error)
      toast.error("Gagal mengaktifkan pengguna")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")) {
      return
    }

    try {
      // Delete user's data first
      await supabase.from("tasks").delete().eq("user_id", userId)
      await supabase.from("categories").delete().eq("user_id", userId)
      await supabase.from("weekly_focus_goals").delete().eq("user_id", userId)
      await supabase.from("activity_logs").delete().eq("user_id", userId)

      // Delete the profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      toast.success("Pengguna berhasil dihapus")
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Gagal menghapus pengguna")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat Data Pengguna...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Pengguna
          </CardTitle>
          <CardDescription>Kelola akun pengguna, role, dan izin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pengguna berdasarkan nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => toast.info("Fitur ekspor akan segera tersedia")}>
              Ekspor Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Pengguna</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Tugas</th>
                  <th className="text-left p-4 font-medium">Bergabung</th>
                  <th className="text-left p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.full_name || "Tidak ada nama"}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={user.role === "super_admin"}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      {user.suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{user.taskCount} total</div>
                        <div className="text-gray-600">{user.completedTaskCount} selesai</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {user.suspended ? (
                          <Button size="sm" variant="outline" onClick={() => unsuspendUser(user.id)}>
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => suspendUser(user.id)}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.role === "super_admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Menampilkan {(page - 1) * limit + 1} hingga {Math.min(page * limit, total)} dari {total} pengguna
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Sebelumnya
          </Button>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * limit >= total}>
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
