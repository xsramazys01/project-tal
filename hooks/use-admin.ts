"use client"

import { useState, useEffect } from "react"
import { adminService, type AdminStats, type UserWithStats } from "@/lib/admin"
import type { AdminSetting, AdminLog } from "@/lib/supabase"

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAdminStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

export function useAdminUsers(page = 1, limit = 10, search = "") {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllUsers(page, limit, search)
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, limit, search])

  const updateUserRole = async (userId: string, role: "user" | "admin" | "super_admin") => {
    const success = await adminService.updateUserRole(userId, role)
    if (success) {
      await fetchUsers()
    }
    return success
  }

  const suspendUser = async (userId: string, reason: string, until?: Date) => {
    const success = await adminService.suspendUser(userId, reason, until)
    if (success) {
      await fetchUsers()
    }
    return success
  }

  const unsuspendUser = async (userId: string) => {
    const success = await adminService.unsuspendUser(userId)
    if (success) {
      await fetchUsers()
    }
    return success
  }

  const deleteUser = async (userId: string) => {
    const success = await adminService.deleteUser(userId)
    if (success) {
      await fetchUsers()
    }
    return success
  }

  return {
    users,
    total,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    suspendUser,
    unsuspendUser,
    deleteUser,
  }
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAdminSettings()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSetting = async (key: string, value: any) => {
    const success = await adminService.updateAdminSetting(key, value)
    if (success) {
      await fetchSettings()
    }
    return success
  }

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSetting,
  }
}

export function useAdminLogs(page = 1, limit = 50) {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAdminLogs(page, limit)
      setLogs(data.logs)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, limit])

  return {
    logs,
    total,
    loading,
    error,
    refetch: fetchLogs,
  }
}
