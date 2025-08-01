"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/task-card"
import { Inbox, Calendar, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: "low" | "medium" | "high"
  deadline: string | null
  day_of_week: number | null
  estimated_time: number | null
  is_scheduled: boolean
  created_at: string
  category_id: string | null
  categories?: {
    name: string
    color: string
    emoji: string
  }
}

interface TaskInboxProps {
  tasks: Task[]
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

export function TaskInbox({ tasks, onUpdate, onDelete }: TaskInboxProps) {
  const [schedulingTask, setSchedulingTask] = useState<string | null>(null)
  const { toast } = useToast()

  const handleScheduleTask = async (taskId: string, dayOfWeek: number) => {
    try {
      setSchedulingTask(taskId)

      const { error } = await supabase
        .from("tasks")
        .update({
          is_scheduled: true,
          day_of_week: dayOfWeek,
        })
        .eq("id", taskId)

      if (error) throw error

      onUpdate(taskId, { is_scheduled: true, day_of_week: dayOfWeek })

      toast({
        title: "Tugas Dijadwalkan",
        description: `Tugas berhasil dijadwalkan untuk hari ${DAYS[dayOfWeek]}`,
      })
    } catch (error: any) {
      console.error("Error scheduling task:", error)
      toast({
        title: "Error",
        description: "Gagal menjadwalkan tugas",
        variant: "destructive",
      })
    } finally {
      setSchedulingTask(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inbox Kosong</h3>
            <p className="text-gray-600 mb-4">Semua tugas telah dijadwalkan atau belum ada tugas baru</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Inbox className="h-5 w-5 mr-2" />
            Tugas Belum Dijadwalkan
          </CardTitle>
          <p className="text-sm text-gray-600">Jadwalkan tugas-tugas ini ke hari tertentu dalam seminggu</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-4">
                <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} showScheduleButton={false} />

                {/* Schedule Options */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Jadwalkan untuk:</span>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {DAYS.map((day, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleScheduleTask(task.id, index)}
                        disabled={schedulingTask === task.id}
                        className="text-xs"
                      >
                        {schedulingTask === task.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                        ) : (
                          <>
                            {day}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
