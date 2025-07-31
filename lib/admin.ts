import { getSupabaseClient, type Profile, type AdminSetting, type AdminLog } from "./supabase"

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  completedTasks: number
  completionRate: number
  newUsersThisWeek: number
  tasksCompletedToday: number
}

export interface UserWithStats extends Profile {
  taskCount: number
  completedTaskCount: number
  lastActive: string | null
}

export class AdminService {
  private supabase = getSupabaseClient()

  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get total users
      const { count: totalUsers } = await this.supabase.from("profiles").select("*", { count: "exact", head: true })

      // Get active users (users with tasks in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: activeUsers } = await this.supabase
        .from("tasks")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString())

      // Get total tasks
      const { count: totalTasks } = await this.supabase.from("tasks").select("*", { count: "exact", head: true })

      // Get completed tasks
      const { count: completedTasks } = await this.supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)

      // Get new users this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: newUsersThisWeek } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())

      // Get tasks completed today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: tasksCompletedToday } = await this.supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)
        .gte("completed_at", today.toISOString())

      const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        completionRate,
        newUsersThisWeek: newUsersThisWeek || 0,
        tasksCompletedToday: tasksCompletedToday || 0,
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        newUsersThisWeek: 0,
        tasksCompletedToday: 0,
      }
    }
  }

  async getAllUsers(page = 1, limit = 10, search = ""): Promise<{ users: UserWithStats[]; total: number }> {
    try {
      let query = this.supabase.from("profiles").select(`
          *,
          tasks!inner(count)
        `)

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const {
        data: users,
        error,
        count,
      } = await query.range((page - 1) * limit, page * limit - 1).order("created_at", { ascending: false })

      if (error) throw error

      // Get task stats for each user
      const usersWithStats: UserWithStats[] = await Promise.all(
        (users || []).map(async (user) => {
          const { count: taskCount } = await this.supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          const { count: completedTaskCount } = await this.supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", true)

          const { data: lastTask } = await this.supabase
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

      return {
        users: usersWithStats,
        total: count || 0,
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      return { users: [], total: 0 }
    }
  }

  async updateUserRole(userId: string, role: "user" | "admin" | "super_admin"): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("profiles").update({ role }).eq("id", userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction("user_role_updated", "user", userId, { new_role: role })

      return true
    } catch (error) {
      console.error("Error updating user role:", error)
      return false
    }
  }

  async suspendUser(userId: string, reason: string, until?: Date): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .update({
          suspended: true,
          suspended_reason: reason,
          suspended_until: until?.toISOString() || null,
        })
        .eq("id", userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction("user_suspended", "user", userId, { reason, until: until?.toISOString() })

      return true
    } catch (error) {
      console.error("Error suspending user:", error)
      return false
    }
  }

  async unsuspendUser(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .update({
          suspended: false,
          suspended_reason: null,
          suspended_until: null,
        })
        .eq("id", userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction("user_unsuspended", "user", userId)

      return true
    } catch (error) {
      console.error("Error unsuspending user:", error)
      return false
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete user's data first (cascading should handle this, but let's be explicit)
      await this.supabase.from("tasks").delete().eq("user_id", userId)
      await this.supabase.from("categories").delete().eq("user_id", userId)
      await this.supabase.from("weekly_focus_goals").delete().eq("user_id", userId)
      await this.supabase.from("activity_logs").delete().eq("user_id", userId)

      // Delete the profile
      const { error } = await this.supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction("user_deleted", "user", userId)

      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  async getAdminSettings(): Promise<AdminSetting[]> {
    try {
      const { data, error } = await this.supabase.from("admin_settings").select("*").order("key")

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching admin settings:", error)
      return []
    }
  }

  async updateAdminSetting(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("admin_settings").upsert({ key, value })

      if (error) throw error

      // Log the action
      await this.logAdminAction("setting_updated", "setting", key, { new_value: value })

      return true
    } catch (error) {
      console.error("Error updating admin setting:", error)
      return false
    }
  }

  async getAdminLogs(page = 1, limit = 50): Promise<{ logs: AdminLog[]; total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from("admin_logs")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      return {
        logs: data || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Error fetching admin logs:", error)
      return { logs: [], total: 0 }
    }
  }

  private async logAdminAction(action: string, targetType: string, targetId?: string, details?: any): Promise<void> {
    try {
      await this.supabase.from("admin_logs").insert({
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      })
    } catch (error) {
      console.error("Error logging admin action:", error)
    }
  }
}

export const adminService = new AdminService()
