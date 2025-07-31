"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminUserManagement } from "@/components/admin/admin-user-management"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminLogs } from "@/components/admin/admin-logs"
import { Shield, Users, Settings, FileText, AlertTriangle } from "lucide-react"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      // Check user role
      import("@/lib/supabase").then(({ getSupabaseClient }) => {
        const supabase = getSupabaseClient()
        supabase
          .from("profiles")
          .select("role, suspended")
          .eq("id", user.id)
          .single()
          .then(({ data, error }) => {
            if (error || !data) {
              console.error("Error fetching user role:", error)
              router.push("/dashboard")
              return
            }

            if (data.suspended || !["admin", "super_admin"].includes(data.role)) {
              router.push("/dashboard")
              return
            }

            setUserRole(data.role)
            setCheckingRole(false)
          })
      })
    }
  }, [user, loading, router])

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">System administration and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={userRole === "super_admin" ? "default" : "secondary"}>
                {userRole === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
              <button onClick={() => router.push("/dashboard")} className="text-gray-600 hover:text-gray-900">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled={userRole !== "super_admin"}>
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="settings">
            {userRole === "super_admin" ? (
              <AdminSettings />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Access Restricted</CardTitle>
                  <CardDescription>Only Super Admins can access system settings.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <AdminLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
