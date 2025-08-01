"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { FileText, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
}

export function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      const { data, error, count } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact" })
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", { ascending: false })

      if (error) throw error

      setLogs(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast.error("Gagal memuat log aktivitas")
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "created":
        return "default"
      case "updated":
        return "secondary"
      case "deleted":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatAction = (action: string) => {
    const actionMap: { [key: string]: string } = {
      created: "Dibuat",
      updated: "Diperbarui",
      deleted: "Dihapus",
    }
    return actionMap[action] || action
  }

  const formatEntityType = (entityType: string) => {
    const typeMap: { [key: string]: string } = {
      tasks: "Tugas",
      categories: "Kategori",
      profiles: "Profil",
      weekly_focus_goals: "Tujuan Mingguan",
    }
    return typeMap[entityType] || entityType
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memuat Log...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Aktivitas Sistem
          </CardTitle>
          <CardDescription>Jejak audit lengkap dari semua aktivitas sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => toast.info("Fitur ekspor akan segera tersedia")}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Waktu</th>
                  <th className="text-left p-4 font-medium">Pengguna</th>
                  <th className="text-left p-4 font-medium">Aksi</th>
                  <th className="text-left p-4 font-medium">Entitas</th>
                  <th className="text-left p-4 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{new Date(log.created_at).toLocaleDateString("id-ID")}</div>
                        <div className="text-gray-600">{new Date(log.created_at).toLocaleTimeString("id-ID")}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-mono text-xs">{log.user_id.substring(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getActionBadgeColor(log.action)}>{formatAction(log.action)}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatEntityType(log.entity_type)}</div>
                        <div className="text-gray-600 font-mono text-xs">{log.entity_id.substring(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {log.details && (
                        <div className="text-sm">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">Lihat Detail</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Menampilkan {(page - 1) * limit + 1} hingga {Math.min(page * limit, total)} dari {total} log
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Sebelumnya
          </Button>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * limit >= total}>
            Selanjutnya
          </Button>
        </div>
      </div>

      {/* Log Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Log</CardTitle>
          <CardDescription>Ringkasan aktivitas sistem terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter((log) => log.entity_type === "tasks").length}
              </div>
              <div className="text-sm text-gray-600">Aktivitas Tugas</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((log) => log.action === "created").length}
              </div>
              <div className="text-sm text-gray-600">Item Dibuat</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter((log) => log.action === "updated").length}
              </div>
              <div className="text-sm text-gray-600">Item Diperbarui</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((log) => log.action === "deleted").length}
              </div>
              <div className="text-sm text-gray-600">Item Dihapus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
