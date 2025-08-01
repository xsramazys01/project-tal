"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  completedTasks: number
  completionRate: number
  newUsersThisWeek: number
  tasksCompletedToday: number
}

export interface UserWithStats {
  id: string
  full_name: string | null
  email: string | null
  role: string
  suspended: boolean
  created_at: string
  taskCount: number
  completedTaskCount: number
  lastActive: string | null
}

export interface AdminSetting {
  id: string
  key: string
  value: any
  description: string | null
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_id: string | null
  target_type: string | null
  details: any
  created_at: string
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

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
    } catch (err) {
      console.error("Error fetching admin stats:", err)
      setError("Failed to fetch admin statistics")
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchStats }
}

export function useAdminUsers(page = 1, limit = 10, search = "") {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, limit, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from("profiles").select("*", { count: "exact" })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get task stats for each user
      const usersWithStats: UserWithStats[] = await Promise.all(
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

          const { data: lastTask } = await supabase
            .from("tasks")
            .select("created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          return {
            ...user,
            taskCount: taskCount || 0,
            completedTaskCount: completedTaskCount || 0,
            lastActive: lastTask?.created_at || null,
          }
        }),
      )

      setUsers(usersWithStats)
      setTotal(count || 0)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: "user" | "admin" | "super_admin"): Promise<boolean> => {
    try {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
      if (error) throw error
      await fetchUsers()
      return true
    } catch (error) {
      console.error("Error updating user role:", error)
      return false
    }
  }

  const suspendUser = async (userId: string, reason: string, until?: Date): Promise<boolean> => {
    try {
      const { error } = await supabase.from("profiles").update({ suspended: true }).eq("id", userId)
      if (error) throw error
      await fetchUsers()
      return true
    } catch (error) {
      console.error("Error suspending user:", error)
      return false
    }
  }

  const unsuspendUser = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("profiles").update({ suspended: false }).eq("id", userId)
      if (error) throw error
      await fetchUsers()
      return true
    } catch (error) {
      console.error("Error unsuspending user:", error)
      return false
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      // Delete user's data first
      await supabase.from("tasks").delete().eq("user_id", userId)
      await supabase.from("categories").delete().eq("user_id", userId)
      await supabase.from("weekly_focus_goals").delete().eq("user_id", userId)
      await supabase.from("activity_logs").delete().eq("user_id", userId)

      // Delete the profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId)
      if (error) throw error
      await fetchUsers()
      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  return {
    users,
    total,
    loading,
    error,
    updateUserRole,
    suspendUser,
    unsuspendUser,
    deleteUser,
    refetch: fetchUsers,
  }
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("admin_settings").select("*").order("key")

      if (error) throw error
      setSettings(data || [])
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError("Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("admin_settings").upsert({ key, value })
      if (error) throw error
      await fetchSettings()
      return true
    } catch (error) {
      console.error("Error updating setting:", error)
      return false
    }
  }

  return { settings, loading, error, updateSetting, refetch: fetchSettings }
}

export function useAdminLogs(page = 1, limit = 50) {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [page, limit])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error, count } = await supabase
        .from("admin_logs")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      setLogs(data || [])
      setTotal(count || 0)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError("Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  return { logs, total, loading, error, refetch: fetchLogs }
}
