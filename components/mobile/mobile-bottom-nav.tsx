"use client"

import { Button } from "@/components/ui/button"
import { Home, Calendar, User, Search } from "lucide-react"

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems = [
    { id: "today", label: "Today", icon: Home },
    { id: "week", label: "Week", icon: Calendar },
    { id: "search", label: "Search", icon: Search },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
              activeTab === item.id ? "text-emerald-600" : "text-gray-500"
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
