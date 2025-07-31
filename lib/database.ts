import { supabase } from "./supabase"
import type { Database } from "./supabase"

// Task operations
export const taskService = {
  // Get all tasks for current user
  async getTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          emoji
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Get tasks for specific week
  async getTasksForWeek(weekStart: Date, weekEnd: Date) {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          emoji
        )
      `)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString())
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Get inbox tasks (unscheduled)
  async getInboxTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        categories (
          id,
          name,
          color,
          emoji
        )
      `)
      .eq("is_scheduled", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Create new task
  async createTask(task: Database["public"]["Tables"]["tasks"]["Insert"]) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No user found")

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...task,
        user_id: user.id,
        is_scheduled: task.day_of_week !== null,
      })
      .select(`
        *,
        categories (
          id,
          name,
          color,
          emoji
        )
      `)
      .single()

    if (error) throw error

    // Log activity
    await this.logActivity("created", "task", data.id, { title: data.title })

    return data
  },

  // Update task
  async updateTask(id: string, updates: Database["public"]["Tables"]["tasks"]["Update"]) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        is_scheduled: updates.day_of_week !== null,
        completed_at: updates.completed ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select(`
        *,
        categories (
          id,
          name,
          color,
          emoji
        )
      `)
      .single()

    if (error) throw error

    // Log activity
    const action = updates.completed ? "completed" : "updated"
    await this.logActivity(action, "task", data.id, { title: data.title })

    return data
  },

  // Delete task
  async deleteTask(id: string) {
    // Get task info before deleting
    const { data: task } = await supabase.from("tasks").select("title").eq("id", id).single()

    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) throw error

    // Log activity
    if (task) {
      await this.logActivity("deleted", "task", id, { title: task.title })
    }

    return true
  },

  // Toggle task completion
  async toggleTaskCompletion(id: string) {
    // Get current task state
    const { data: currentTask } = await supabase.from("tasks").select("completed").eq("id", id).single()

    if (!currentTask) throw new Error("Task not found")

    const newCompleted = !currentTask.completed

    return this.updateTask(id, {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    })
  },

  // Log user activity
  async logActivity(action: string, entityType: string, entityId: string, metadata?: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
  },
}

// Category operations
export const categoryService = {
  // Get all categories for current user
  async getCategories() {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) throw error
    return data
  },

  // Create new category
  async createCategory(category: Database["public"]["Tables"]["categories"]["Insert"]) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No user found")

    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...category,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update category
  async updateCategory(id: string, updates: Database["public"]["Tables"]["categories"]["Update"]) {
    const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  // Delete category
  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) throw error
    return true
  },
}

// Weekly Focus Goals operations
export const weeklyFocusService = {
  // Get goals for specific week
  async getWeeklyGoals(weekStartDate: Date) {
    const { data, error } = await supabase
      .from("weekly_focus_goals")
      .select("*")
      .eq("week_start_date", weekStartDate.toISOString().split("T")[0])
      .order("created_at")

    if (error) throw error
    return data
  },

  // Create new weekly goal
  async createWeeklyGoal(goal: Database["public"]["Tables"]["weekly_focus_goals"]["Insert"]) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No user found")

    const { data, error } = await supabase
      .from("weekly_focus_goals")
      .insert({
        ...goal,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update weekly goal
  async updateWeeklyGoal(id: string, updates: Database["public"]["Tables"]["weekly_focus_goals"]["Update"]) {
    const { data, error } = await supabase.from("weekly_focus_goals").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  // Delete weekly goal
  async deleteWeeklyGoal(id: string) {
    const { error } = await supabase.from("weekly_focus_goals").delete().eq("id", id)

    if (error) throw error
    return true
  },
}

// Analytics operations
export const analyticsService = {
  // Get user activity logs
  async getActivityLogs(limit = 50) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get task completion stats
  async getTaskStats() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No user found")

    // Get total tasks
    const { count: totalTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get completed tasks
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)

    // Get overdue tasks
    const { count: overdueTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", false)
      .lt("deadline", new Date().toISOString())

    return {
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      overdueTasks: overdueTasks || 0,
      completionRate: totalTasks ? Math.round(((completedTasks || 0) / totalTasks) * 100) : 0,
    }
  },
}
