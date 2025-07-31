"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, CheckCircle, Plus, Edit, Trash2 } from "lucide-react"
import { analyticsService } from "@/lib/database"
import type { ActivityLog } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"

const getActivityIcon = (action: string) => {
  switch (action) {
    case "created":
      return Plus
    case "completed":
      return CheckCircle
    case "updated":
      return Edit
    case "deleted":
      return Trash2
    default:
      return Activity
  }
}

const getActivityColor = (action: string) => {
  switch (action) {
    case "created":
      return "text-blue-600"
    case "completed":
      return "text-green-600"
    case "updated":
      return "text-orange-600"
    case "deleted":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

const getActivityDescription = (log: ActivityLog) => {
  const entityName = log.metadata?.title || `${log.entity_type} ${log.entity_id.slice(0, 8)}`

  switch (log.action) {
    case "created":
      return `Created ${log.entity_type}: "${entityName}"`
    case "completed":
      return `Completed ${log.entity_type}: "${entityName}"`
    case "updated":
      return `Updated ${log.entity_type}: "${entityName}"`
    case "deleted":
      return `Deleted ${log.entity_type}: "${entityName}"`
    default:
      return `${log.action} ${log.entity_type}: "${entityName}"`
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadActivities = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.getActivityLogs(20)
      setActivities(data)
    } catch (error) {
      console.error("Failed to load activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Your task activities will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.action)
                const iconColor = getActivityColor(activity.action)

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full bg-gray-100 ${iconColor}`}>
                      <Icon className="h-3 w-3" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{getActivityDescription(activity)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.action}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
