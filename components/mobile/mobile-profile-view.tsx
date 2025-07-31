"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  TrendingUp,
  Target,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: "high" | "medium" | "low"
  deadline: string
  completed: boolean
  estimatedTime?: number
  dayOfWeek: number
  createdAt: string
  completedAt?: string
  location?: string
}

interface MobileProfileViewProps {
  tasks: Task[]
}

export function MobileProfileView({ tasks }: MobileProfileViewProps) {
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const thisWeekTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt)
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    return taskDate >= weekStart
  })

  const stats = [
    {
      label: "Tasks Completed",
      value: completedTasks.toString(),
      icon: Target,
      color: "text-emerald-600",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "This Week",
      value: thisWeekTasks.length.toString(),
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      label: "Streak",
      value: "7 days",
      icon: Award,
      color: "text-orange-600",
    },
  ]

  const menuItems = [
    {
      label: "Account Settings",
      icon: User,
      description: "Manage your profile and preferences",
    },
    {
      label: "Notifications",
      icon: Bell,
      description: "Configure alerts and reminders",
      badge: "2",
    },
    {
      label: "App Settings",
      icon: Settings,
      description: "Customize your app experience",
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      description: "Get help and contact support",
    },
  ]

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="text-lg">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
              <p className="text-sm text-gray-500">john@example.com</p>
              <Badge variant="secondary" className="mt-1">
                Pro Member
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Completed this week</span>
              <span className="font-medium">
                {thisWeekTasks.filter((task) => task.completed).length}/{thisWeekTasks.length}
              </span>
            </div>
            <Progress
              value={
                thisWeekTasks.length > 0
                  ? (thisWeekTasks.filter((task) => task.completed).length / thisWeekTasks.length) * 100
                  : 0
              }
              className="h-2"
            />
            <div className="text-center">
              <span className="text-lg font-bold text-emerald-600">
                {thisWeekTasks.length > 0
                  ? Math.round((thisWeekTasks.filter((task) => task.completed).length / thisWeekTasks.length) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Award className="mr-2 h-5 w-5 text-yellow-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Week Warrior</h4>
              <p className="text-sm text-gray-500">Completed all tasks this week</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Consistency King</h4>
              <p className="text-sm text-gray-500">7-day completion streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  )
}
