"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAdminSettings } from "@/hooks/use-admin"
import { useToast } from "@/hooks/use-toast"
import { Save, Settings } from "lucide-react"

export function AdminSettings() {
  const { settings, loading, error, updateSetting } = useAdminSettings()
  const { toast } = useToast()
  const [saving, setSaving] = useState<string | null>(null)

  const handleUpdateSetting = async (key: string, value: any) => {
    setSaving(key)
    const success = await updateSetting(key, value)

    if (success) {
      toast({
        title: "Setting Updated",
        description: "Setting has been updated successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive",
      })
    }
    setSaving(null)
  }

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find((s) => s.key === key)
    return setting ? setting.value : defaultValue
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Settings...</CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Settings</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
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
            General Settings
          </CardTitle>
          <CardDescription>Configure general application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="site_name">Site Name</Label>
              <div className="flex gap-2">
                <Input
                  id="site_name"
                  defaultValue={getSetting("site_name", "To-Achieve List")}
                  onBlur={(e) => handleUpdateSetting("site_name", e.target.value)}
                />
                {saving === "site_name" && (
                  <Button disabled size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="max_tasks">Max Tasks Per User</Label>
              <div className="flex gap-2">
                <Input
                  id="max_tasks"
                  type="number"
                  defaultValue={getSetting("max_tasks_per_user", 1000)}
                  onBlur={(e) => handleUpdateSetting("max_tasks_per_user", Number.parseInt(e.target.value))}
                />
                {saving === "max_tasks_per_user" && (
                  <Button disabled size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="session_timeout">Session Timeout (seconds)</Label>
              <div className="flex gap-2">
                <Input
                  id="session_timeout"
                  type="number"
                  defaultValue={getSetting("session_timeout", 86400)}
                  onBlur={(e) => handleUpdateSetting("session_timeout", Number.parseInt(e.target.value))}
                />
                {saving === "session_timeout" && (
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
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure security and access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>User Registration</Label>
              <div className="text-sm text-gray-600">Allow new users to register accounts</div>
            </div>
            <Switch
              checked={getSetting("registration_enabled", true)}
              onCheckedChange={(checked) => handleUpdateSetting("registration_enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <div className="text-sm text-gray-600">Put the site in maintenance mode</div>
            </div>
            <Switch
              checked={getSetting("maintenance_mode", false)}
              onCheckedChange={(checked) => handleUpdateSetting("maintenance_mode", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure email notifications and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Welcome Emails</Label>
              <div className="text-sm text-gray-600">Send welcome emails to new users</div>
            </div>
            <Switch
              checked={getSetting("welcome_emails", true)}
              onCheckedChange={(checked) => handleUpdateSetting("welcome_emails", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Reminders</Label>
              <div className="text-sm text-gray-600">Send email reminders for upcoming tasks</div>
            </div>
            <Switch
              checked={getSetting("task_reminders", true)}
              onCheckedChange={(checked) => handleUpdateSetting("task_reminders", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <div className="text-sm text-gray-600">Send weekly progress reports to users</div>
            </div>
            <Switch
              checked={getSetting("weekly_reports", false)}
              onCheckedChange={(checked) => handleUpdateSetting("weekly_reports", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Settings</CardTitle>
          <CardDescription>Configure performance and caching settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="cache_duration">Cache Duration (minutes)</Label>
            <div className="flex gap-2">
              <Input
                id="cache_duration"
                type="number"
                defaultValue={getSetting("cache_duration", 60)}
                onBlur={(e) => handleUpdateSetting("cache_duration", Number.parseInt(e.target.value))}
              />
              {saving === "cache_duration" && (
                <Button disabled size="sm">
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="api_rate_limit">API Rate Limit (requests per minute)</Label>
            <div className="flex gap-2">
              <Input
                id="api_rate_limit"
                type="number"
                defaultValue={getSetting("api_rate_limit", 100)}
                onBlur={(e) => handleUpdateSetting("api_rate_limit", Number.parseInt(e.target.value))}
              />
              {saving === "api_rate_limit" && (
                <Button disabled size="sm">
                  <Save className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
