"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminStats } from "@/hooks/use-admin"
import { Users, CheckCircle, TrendingUp, Calendar, Activity, UserPlus, Target } from "lucide-react"

export function AdminDashboard() {
  const { stats, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.newUsersThisWeek} new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.tasksCompletedToday} completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.completedTasks.toLocaleString()} tasks completed</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Response</span>
              <Badge variant="default" className="bg-green-500">
                Fast
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage</span>
              <Badge variant="default" className="bg-yellow-500">
                Normal
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">Create Admin User</div>
                  <div className="text-sm text-gray-600">Add a new administrator</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-600">Detailed system analytics</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">System Maintenance</div>
                  <div className="text-sm text-gray-600">Schedule maintenance tasks</div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Recent system activity and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.newUsersThisWeek}</div>
              <div className="text-sm text-gray-600">New Users This Week</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.tasksCompletedToday}</div>
              <div className="text-sm text-gray-600">Tasks Completed Today</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-gray-600">User Engagement Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
