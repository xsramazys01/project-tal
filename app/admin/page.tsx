"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminUserManagement } from "@/components/admin/admin-user-management"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminLogs } from "@/components/admin/admin-logs"
import { Shield, Users, Settings, FileText, AlertTriangle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

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
      checkUserRole()
    }
  }, [user, loading, router])

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("role, suspended").eq("id", user?.id).single()

      if (error) {
        console.error("Error fetching user role:", error)
        toast.error("Gagal memuat data pengguna")
        router.push("/dashboard")
        return
      }

      if (!data || data.suspended || !["admin", "super_admin"].includes(data.role)) {
        toast.error("Anda tidak memiliki akses ke panel admin")
        router.push("/dashboard")
        return
      }

      setUserRole(data.role)
      setCheckingRole(false)
    } catch (error) {
      console.error("Error checking user role:", error)
      toast.error("Terjadi kesalahan saat memuat data")
      router.push("/dashboard")
    }
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat panel admin...</p>
        </div>
      </div>
    )
  }

  if (!user || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Akses Ditolak
            </CardTitle>
            <CardDescription>Anda tidak memiliki izin untuk mengakses panel admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
                <p className="text-gray-600">Administrasi dan manajemen sistem</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={userRole === "super_admin" ? "default" : "secondary"} className="px-3 py-1">
                {userRole === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
              <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Users className="h-4 w-4" />
              Pengguna
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              disabled={userRole !== "super_admin"}
            >
              <Settings className="h-4 w-4" />
              Pengaturan
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FileText className="h-4 w-4" />
              Log Aktivitas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {userRole === "super_admin" ? (
              <AdminSettings />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    Akses Terbatas
                  </CardTitle>
                  <CardDescription>Hanya Super Admin yang dapat mengakses pengaturan sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Hubungi Super Admin untuk mengubah pengaturan sistem.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdminLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
