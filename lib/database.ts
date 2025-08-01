import { supabase } from "./supabase"
import type { Database } from "./database.types"

type Tables = Database["public"]["Tables"]
type Task = Tables["tasks"]["Row"]
type UserProfile = Tables["user_profiles"]["Row"]
type TaskAssignment = Tables["task_assignments"]["Row"]
type DailyReport = Tables["daily_reports"]["Row"]
type WeeklyReport = Tables["weekly_reports"]["Row"]
type MonthlyReport = Tables["monthly_reports"]["Row"]
type Holiday = Tables["holidays"]["Row"]
type SystemSetting = Tables["system_settings"]["Row"]

// Task Service
export const taskService = {
  async getTasks(userId: string, taskType?: string) {
    let query = supabase
      .from("tasks")
      .select(`
        *,
        task_assignments(
          assigned_to_id,
          user_profiles!task_assignments_assigned_to_id_fkey(username, full_name)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (taskType) {
      query = query.eq("task_type", taskType)
    }

    return await query
  },

  async createTask(task: Tables["tasks"]["Insert"]) {
    return await supabase.from("tasks").insert(task).select().single()
  },

  async updateTask(id: string, updates: Tables["tasks"]["Update"]) {
    return await supabase.from("tasks").update(updates).eq("id", id).select().single()
  },

  async deleteTask(id: string) {
    return await supabase.from("tasks").delete().eq("id", id)
  },

  async getTasksByDateRange(userId: string, startDate: string, endDate: string, taskType: string) {
    let query = supabase.from("tasks").select("*").eq("user_id", userId).eq("task_type", taskType)

    if (taskType === "daily") {
      query = query.gte("task_date", startDate).lte("task_date", endDate)
    } else if (taskType === "weekly") {
      query = query.gte("week_start_date", startDate).lte("week_start_date", endDate)
    } else if (taskType === "monthly") {
      query = query.gte("month_year", startDate.slice(0, 7)).lte("month_year", endDate.slice(0, 7))
    }

    return await query.order("created_at", { ascending: true })
  },

  async lockTasks(userId: string, taskIds: string[]) {
    return await supabase
      .from("tasks")
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .in("id", taskIds)
  },
}

// User Profile Service
export const userProfileService = {
  async getProfile(userId: string) {
    return await supabase.from("user_profiles").select("*").eq("id", userId).single()
  },

  async createProfile(profile: Tables["user_profiles"]["Insert"]) {
    return await supabase.from("user_profiles").insert(profile).select().single()
  },

  async updateProfile(userId: string, updates: Tables["user_profiles"]["Update"]) {
    return await supabase.from("user_profiles").update(updates).eq("id", userId).select().single()
  },

  async getAllUsers() {
    return await supabase
      .from("user_profiles")
      .select("*")
      .eq("status", "active")
      .order("full_name", { ascending: true })
  },

  async getUsersByType(userType: string) {
    return await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_type", userType)
      .eq("status", "active")
      .order("full_name", { ascending: true })
  },
}

// Task Assignment Service
export const taskAssignmentService = {
  async getAssignments(taskId: string) {
    return await supabase
      .from("task_assignments")
      .select(`
        *,
        user_profiles!task_assignments_assigned_to_id_fkey(username, full_name)
      `)
      .eq("task_id", taskId)
  },

  async createAssignments(assignments: Tables["task_assignments"]["Insert"][]) {
    return await supabase.from("task_assignments").insert(assignments)
  },

  async deleteAssignments(taskId: string) {
    return await supabase.from("task_assignments").delete().eq("task_id", taskId)
  },

  async getAssignedTasks(userId: string) {
    return await supabase
      .from("task_assignments")
      .select(`
        *,
        tasks(*)
      `)
      .eq("assigned_to_id", userId)
  },
}

// Report Services
export const reportService = {
  // Daily Reports
  async getDailyReports(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", userId)
      .order("report_date", { ascending: false })

    if (startDate && endDate) {
      query = query.gte("report_date", startDate).lte("report_date", endDate)
    }

    return await query
  },

  async createDailyReport(report: Tables["daily_reports"]["Insert"]) {
    return await supabase.from("daily_reports").insert(report).select().single()
  },

  async updateDailyReport(id: string, updates: Tables["daily_reports"]["Update"]) {
    return await supabase.from("daily_reports").update(updates).eq("id", id).select().single()
  },

  // Weekly Reports
  async getWeeklyReports(userId: string, year?: number) {
    let query = supabase
      .from("weekly_reports")
      .select("*")
      .eq("user_id", userId)
      .order("week_start_date", { ascending: false })

    if (year) {
      query = query.like("month_year", `${year}-%`)
    }

    return await query
  },

  async createWeeklyReport(report: Tables["weekly_reports"]["Insert"]) {
    return await supabase.from("weekly_reports").insert(report).select().single()
  },

  async updateWeeklyReport(id: string, updates: Tables["weekly_reports"]["Update"]) {
    return await supabase.from("weekly_reports").update(updates).eq("id", id).select().single()
  },

  // Monthly Reports
  async getMonthlyReports(userId: string, year?: number) {
    let query = supabase
      .from("monthly_reports")
      .select("*")
      .eq("user_id", userId)
      .order("month_year", { ascending: false })

    if (year) {
      query = query.like("month_year", `${year}-%`)
    }

    return await query
  },

  async createMonthlyReport(report: Tables["monthly_reports"]["Insert"]) {
    return await supabase.from("monthly_reports").insert(report).select().single()
  },

  async updateMonthlyReport(id: string, updates: Tables["monthly_reports"]["Update"]) {
    return await supabase.from("monthly_reports").update(updates).eq("id", id).select().single()
  },
}

// Holiday Service
export const holidayService = {
  async getHolidays(year?: number) {
    let query = supabase.from("holidays").select("*").order("holiday_date", { ascending: true })

    if (year) {
      query = query.gte("holiday_date", `${year}-01-01`).lte("holiday_date", `${year}-12-31`)
    }

    return await query
  },

  async createHoliday(holiday: Tables["holidays"]["Insert"]) {
    return await supabase.from("holidays").insert(holiday).select().single()
  },

  async updateHoliday(id: string, updates: Tables["holidays"]["Update"]) {
    return await supabase.from("holidays").update(updates).eq("id", id).select().single()
  },

  async deleteHoliday(id: string) {
    return await supabase.from("holidays").delete().eq("id", id)
  },
}

// System Settings Service
export const systemSettingsService = {
  async getSettings() {
    return await supabase.from("system_settings").select("*").order("setting_key", { ascending: true })
  },

  async getSetting(key: string) {
    return await supabase.from("system_settings").select("*").eq("setting_key", key).single()
  },

  async updateSetting(key: string, value: any, description?: string) {
    return await supabase
      .from("system_settings")
      .upsert({
        setting_key: key,
        setting_value: value,
        description: description,
      })
      .select()
      .single()
  },
}

// Utility functions
export const dbUtils = {
  async checkConnection() {
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      return { connected: !error, error }
    } catch (error) {
      return { connected: false, error }
    }
  },

  async getUserStats(userId: string) {
    // Get tasks stats
    const { data: tasks } = await taskService.getTasks(userId)
    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((task) => task.status === "done").length || 0
    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get today's tasks
    const today = new Date().toISOString().split("T")[0]
    const { data: todayTasks } = await taskService.getTasksByDateRange(userId, today, today, "daily")
    const todayTotal = todayTasks?.length || 0
    const todayCompleted = todayTasks?.filter((task) => task.status === "done").length || 0

    // Get this week's tasks
    const weekStart = getWeekStart(new Date()).toISOString().split("T")[0]
    const weekEnd = getWeekEnd(new Date()).toISOString().split("T")[0]
    const { data: weekTasks } = await taskService.getTasksByDateRange(userId, weekStart, weekEnd, "weekly")
    const weekTotal = weekTasks?.length || 0
    const weekCompleted = weekTasks?.filter((task) => task.status === "done").length || 0

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      today: {
        total: todayTotal,
        completed: todayCompleted,
        pending: todayTotal - todayCompleted,
      },
      week: {
        total: weekTotal,
        completed: weekCompleted,
        pending: weekTotal - weekCompleted,
      },
    }
  },
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
}
