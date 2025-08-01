"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Loader2, Upload } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: () => void
  task?: any
  taskType?: "daily" | "weekly" | "monthly"
}

interface UserOption {
  id: string
  username: string
  full_name: string
}

export function TaskDialog({ open, onOpenChange, onTaskCreated, task, taskType = "daily" }: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"result" | "non_result">("non_result")
  const [targetValue, setTargetValue] = useState("")
  const [targetUnit, setTargetUnit] = useState("unit")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [taskDate, setTaskDate] = useState<Date>()
  const [weekStartDate, setWeekStartDate] = useState<Date>()
  const [monthYear, setMonthYear] = useState("")
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [parentTaskId, setParentTaskId] = useState("")
  const [notes, setNotes] = useState("")

  const [users, setUsers] = useState<UserOption[]>([])
  const [parentTasks, setParentTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (open) {
      loadInitialData()
      if (task) {
        populateTaskData(task)
      } else {
        resetForm()
      }
    }
  }, [open, task, taskType])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("non_result")
    setTargetValue("")
    setTargetUnit("unit")
    setPriority("medium")
    setTaskDate(undefined)
    setWeekStartDate(undefined)
    setMonthYear("")
    setAssignedUsers([])
    setParentTaskId("")
    setNotes("")

    // Set default dates based on task type
    const today = new Date()
    if (taskType === "daily") {
      setTaskDate(today)
    } else if (taskType === "weekly") {
      setWeekStartDate(getWeekStart(today))
    } else if (taskType === "monthly") {
      setMonthYear(today.toISOString().slice(0, 7))
    }
  }

  const populateTaskData = (taskData: any) => {
    setTitle(taskData.title || "")
    setDescription(taskData.description || "")
    setCategory(taskData.category || "non_result")
    setTargetValue(taskData.target_value?.toString() || "")
    setTargetUnit(taskData.target_unit || "unit")
    setPriority(taskData.priority || "medium")
    setNotes(taskData.notes || "")
    setParentTaskId(taskData.parent_task_id || "")

    if (taskData.task_date) setTaskDate(new Date(taskData.task_date))
    if (taskData.week_start_date) setWeekStartDate(new Date(taskData.week_start_date))
    if (taskData.month_year) setMonthYear(taskData.month_year)
  }

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load users for assignment
      const { data: usersData } = await supabase
        .from("user_profiles")
        .select("id, username, full_name")
        .eq("status", "active")

      if (usersData) {
        setUsers(usersData)
      }

      // Load parent tasks based on task type
      if (taskType === "daily") {
        // Load weekly tasks as potential parents
        const { data: weeklyTasks } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("task_type", "weekly")
          .order("created_at", { ascending: false })
          .limit(10)

        if (weeklyTasks) {
          setParentTasks(weeklyTasks)
        }
      } else if (taskType === "weekly") {
        // Load monthly tasks as potential parents
        const { data: monthlyTasks } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("task_type", "monthly")
          .order("created_at", { ascending: false })
          .limit(10)

        if (monthlyTasks) {
          setParentTasks(monthlyTasks)
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Judul kegiatan harus diisi")
      return
    }

    try {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("User tidak terautentikasi")
        return
      }

      const taskData = {
        user_id: user.id,
        task_type: taskType,
        title: title.trim(),
        description: description.trim() || null,
        category,
        target_value: category === "result" && targetValue ? Number.parseFloat(targetValue) : null,
        target_unit: category === "result" ? targetUnit : null,
        priority,
        parent_task_id: parentTaskId || null,
        notes: notes.trim() || null,
        task_date: taskType === "daily" ? taskDate?.toISOString().split("T")[0] : null,
        week_start_date: taskType === "weekly" ? weekStartDate?.toISOString().split("T")[0] : null,
        month_year: taskType === "monthly" ? monthYear : null,
        status: "pending",
        is_locked: false,
        is_reported: false,
      }

      let result
      if (task) {
        // Update existing task
        result = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", task.id)
          .eq("user_id", user.id)
          .select()
          .single()
      } else {
        // Create new task
        result = await supabase.from("tasks").insert([taskData]).select().single()
      }

      if (result.error) throw result.error

      // Handle task assignments
      if (result.data && assignedUsers.length > 0) {
        // Delete existing assignments if updating
        if (task) {
          await supabase.from("task_assignments").delete().eq("task_id", result.data.id)
        }

        // Insert new assignments
        const assignments = assignedUsers.map((userId) => ({
          task_id: result.data.id,
          assigned_to_id: userId,
          assigned_by_id: user.id,
        }))

        await supabase.from("task_assignments").insert(assignments)
      }

      toast.success(task ? "Tugas berhasil diperbarui!" : "Tugas berhasil dibuat!")
      onTaskCreated?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving task:", error)
      toast.error(`Gagal ${task ? "memperbarui" : "membuat"} tugas: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAssignment = (userId: string, checked: boolean) => {
    if (checked) {
      setAssignedUsers((prev) => [...prev, userId])
    } else {
      setAssignedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit" : "Buat"} Tugas{" "}
            {taskType === "daily" ? "Harian" : taskType === "weekly" ? "Mingguan" : "Bulanan"}
          </DialogTitle>
          <DialogDescription>
            {task ? "Perbarui informasi tugas." : "Tambahkan tugas baru ke daftar Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="grid gap-4">
            {taskType === "daily" && (
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !taskDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskDate ? format(taskDate, "PPP", { locale: id }) : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={taskDate} onSelect={setTaskDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {taskType === "weekly" && (
              <div className="space-y-2">
                <Label>Minggu (Tanggal Mulai) *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !weekStartDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {weekStartDate ? format(weekStartDate, "PPP", { locale: id }) : "Pilih minggu"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={weekStartDate} onSelect={setWeekStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {taskType === "monthly" && (
              <div className="space-y-2">
                <Label htmlFor="monthYear">Bulan *</Label>
                <Input
                  id="monthYear"
                  type="month"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Basic Task Info */}
          <div className="space-y-2">
            <Label htmlFor="title">Judul Kegiatan *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul kegiatan..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Kegiatan</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi kegiatan..."
              rows={3}
            />
          </div>

          {/* Parent Task */}
          {parentTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Parent Task</Label>
              <Select value={parentTaskId} onValueChange={setParentTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent task (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada parent task</SelectItem>
                  {parentTasks.map((parentTask) => (
                    <SelectItem key={parentTask.id} value={parentTask.id}>
                      {parentTask.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category and Target */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={category} onValueChange={(value: "result" | "non_result") => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="result">Result</SelectItem>
                  <SelectItem value="non_result">Non Result</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioritas *</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target (only for result category) */}
          {category === "result" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Masukkan target..."
                />
              </div>
              <div className="space-y-2">
                <Label>Satuan Target</Label>
                <Select value={targetUnit} onValueChange={setTargetUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rupiah">Rupiah</SelectItem>
                    <SelectItem value="noa">NOA</SelectItem>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="custom">Isi Sendiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Task Assignment */}
          <div className="space-y-2">
            <Label>Tugaskan Ke</Label>
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              {isLoadingData ? (
                <p className="text-sm text-gray-500">Memuat pengguna...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada pengguna tersedia</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={assignedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserAssignment(user.id, checked as boolean)}
                      />
                      <Label htmlFor={`user-${user.id}`} className="text-sm">
                        {user.full_name} ({user.username})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Kosongkan jika untuk diri sendiri</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
            />
          </div>

          {/* File Upload Placeholder */}
          <div className="space-y-2">
            <Label>Lampiran</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Upload foto atau video</p>
              <p className="text-xs text-gray-400">Fitur akan segera tersedia</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {task ? "Perbarui" : "Buat"} Tugas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
