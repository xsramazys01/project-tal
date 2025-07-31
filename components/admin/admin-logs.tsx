"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdminLogs } from "@/hooks/use-admin"
import { FileText, Download, RefreshCw } from "lucide-react"

export function AdminLogs() {
  const [page, setPage] = useState(1)
  const { logs, total, loading, error, refetch } = useAdminLogs(page, 50)

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "user_created":
      case "user_role_updated":
        return "default"
      case "user_suspended":
      case "user_deleted":
        return "destructive"
      case "setting_updated":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Logs...</CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Logs</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
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
            Admin Activity Logs
          </CardTitle>
          <CardDescription>Complete audit trail of all administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
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
                  <th className="text-left p-4 font-medium">Timestamp</th>
                  <th className="text-left p-4 font-medium">Admin</th>
                  <th className="text-left p-4 font-medium">Action</th>
                  <th className="text-left p-4 font-medium">Target</th>
                  <th className="text-left p-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                        <div className="text-gray-600">{new Date(log.created_at).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.admin_id}</div>
                        {log.ip_address && <div className="text-gray-600">{log.ip_address}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getActionBadgeColor(log.action)}>{formatAction(log.action)}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.target_type}</div>
                        {log.target_id && (
                          <div className="text-gray-600 font-mono text-xs">{log.target_id.substring(0, 8)}...</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {log.details && (
                        <div className="text-sm">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">View Details</summary>
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
          Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} logs
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page * 50 >= total}>
            Next
          </Button>
        </div>
      </div>

      {/* Log Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Log Statistics</CardTitle>
          <CardDescription>Summary of recent administrative activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter((log) => log.action.includes("user")).length}
              </div>
              <div className="text-sm text-gray-600">User Actions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((log) => log.action.includes("setting")).length}
              </div>
              <div className="text-sm text-gray-600">Setting Changes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((log) => log.action.includes("delete") || log.action.includes("suspend")).length}
              </div>
              <div className="text-sm text-gray-600">Security Actions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{total}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
