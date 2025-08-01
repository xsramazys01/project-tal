"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { Save, Settings } from "lucide-react"
import { toast } from "sonner"

interface AdminSetting {
  id: string
  key: string
  value: any
  description: string | null
}

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("admin_settings").select("*").order("key")

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Gagal memuat pengaturan")
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    setSaving(key)
    try {
      const { error } = await supabase.from("admin_settings").upsert({ key, value })

      if (error) throw error

      toast.success("Pengaturan berhasil diperbarui")
      fetchSettings()
    } catch (error) {
      console.error("Error updating setting:", error)
      toast.error("Gagal memperbarui pengaturan")
    } finally {
      setSaving(null)
    }
  }

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find((s) => s.key === key)
    return setting ? setting.value : defaultValue
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat Pengaturan...</CardTitle>
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
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Umum
          </CardTitle>
          <CardDescription>Konfigurasi pengaturan aplikasi umum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="app_name">Nama Aplikasi</Label>
              <div className="flex gap-2">
                <Input
                  id="app_name"
                  defaultValue={getSetting("app_name", "TAL - Task and Life Manager")}
                  onBlur={(e) => updateSetting("app_name", e.target.value)}
                />
                {saving === "app_name" && (
                  <Button disabled size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="max_tasks">Maksimal Tugas Per Pengguna</Label>
              <div className="flex gap-2">
                <Input
                  id="max_tasks"
                  type="number"
                  defaultValue={getSetting("max_tasks_per_user", 1000)}
                  onBlur={(e) => updateSetting("max_tasks_per_user", Number.parseInt(e.target.value))}
                />
                {saving === "max_tasks_per_user" && (
                  <Button disabled size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Keamanan</CardTitle>
          <CardDescription>Konfigurasi keamanan dan kontrol akses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Registrasi Pengguna</Label>
              <div className="text-sm text-gray-600">Izinkan pengguna baru mendaftar akun</div>
            </div>
            <Switch
              checked={getSetting("user_registration_enabled", true)}
              onCheckedChange={(checked) => updateSetting("user_registration_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode Pemeliharaan</Label>
              <div className="text-sm text-gray-600">Aktifkan mode pemeliharaan situs</div>
            </div>
            <Switch
              checked={getSetting("maintenance_mode", false)}
              onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Notifikasi</CardTitle>
          <CardDescription>Konfigurasi notifikasi dan template email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifikasi Push</Label>
              <div className="text-sm text-gray-600">Aktifkan notifikasi push untuk pengguna</div>
            </div>
            <Switch
              checked={getSetting("enable_notifications", true)}
              onCheckedChange={(checked) => updateSetting("enable_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Selamat Datang</Label>
              <div className="text-sm text-gray-600">Kirim email selamat datang ke pengguna baru</div>
            </div>
            <Switch
              checked={getSetting("welcome_emails", true)}
              onCheckedChange={(checked) => updateSetting("welcome_emails", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pengingat Tugas</Label>
              <div className="text-sm text-gray-600">Kirim pengingat email untuk tugas yang akan datang</div>
            </div>
            <Switch
              checked={getSetting("task_reminders", true)}
              onCheckedChange={(checked) => updateSetting("task_reminders", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
