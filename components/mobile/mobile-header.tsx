"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Target } from "lucide-react"

interface MobileHeaderProps {
  currentTime: Date
}

export function MobileHeader({ currentTime }: MobileHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-emerald-600" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">To-Achieve</h1>
            <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{formatTime(currentTime)}</p>
            <p className="text-xs text-gray-500">Now</p>
          </div>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">2</Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
