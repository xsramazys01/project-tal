"use client"

import { useState, useEffect } from "react"
import { taskService } from "@/lib/database"
import type { Task } from "@/lib/supabase"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true)
      const [allTasks, inbox] = await Promise.all([taskService.getTasks(), taskService.getInboxTasks()])

      // Filter scheduled vs inbox tasks
      const scheduledTasks = allTasks.filter((task) => task.is_scheduled)

      setTasks(scheduledTasks)
      setInboxTasks(inbox)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  // Create task
  const createTask = async (taskData: Parameters<typeof taskService.createTask>[0]) => {
    try {
      const newTask = await taskService.createTask(taskData)

      if (newTask.is_scheduled) {
        setTasks((prev) => [newTask, ...prev])
      } else {
        setInboxTasks((prev) => [newTask, ...prev])
      }

      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
      throw err
    }
  }

  // Update task
  const updateTask = async (id: string, updates: Parameters<typeof taskService.updateTask>[1]) => {
    try {
      const updatedTask = await taskService.updateTask(id, updates)

      // Update in the appropriate list
      if (updatedTask.is_scheduled) {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
        // Remove from inbox if it was moved there
        setInboxTasks((prev) => prev.filter((task) => task.id !== id))
      } else {
        setInboxTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
        // Remove from tasks if it was moved there
        setTasks((prev) => prev.filter((task) => task.id !== id))
      }

      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
      throw err
    }
  }

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
      setInboxTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
      throw err
    }
  }

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    try {
      const updatedTask = await taskService.toggleTaskCompletion(id)
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle task")
      throw err
    }
  }

  // Schedule inbox task
  const scheduleInboxTask = async (taskId: string, dayOfWeek: number) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, {
        day_of_week: dayOfWeek,
        is_scheduled: true,
      })

      // Move from inbox to tasks
      setInboxTasks((prev) => prev.filter((task) => task.id !== taskId))
      setTasks((prev) => [updatedTask, ...prev])

      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule task")
      throw err
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return {
    tasks,
    inboxTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    scheduleInboxTask,
    refetch: loadTasks,
  }
}
