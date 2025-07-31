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
}

interface WeeklyObjectiveData {
  week: number
  status: "completed" | "late" | "not_sent"
  dp: number // Daily Planning score
  rh: number // Report Harian score
  wo: number // Weekly Objective score
  total: number
  percentage: number
  tasks: Task[]
}

interface MonthlyObjectiveData {
  month: string
  staff: number
  structural: number
  average: number
  weeklyData: WeeklyObjectiveData[]
}

export function calculateWeeklyScore(tasks: Task[], weekStartDate: Date): WeeklyObjectiveData {
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekStartDate.getDate() + 6)

  // Filter tasks for this specific week
  const weekTasks = tasks.filter((task) => {
    const taskDate = new Date(task.createdAt)
    return taskDate >= weekStartDate && taskDate <= weekEndDate
  })

  const totalTasks = weekTasks.length
  const completedTasks = weekTasks.filter((task) => task.completed).length
  const highPriorityTasks = weekTasks.filter((task) => task.priority === "high").length
  const completedHighPriority = weekTasks.filter((task) => task.priority === "high" && task.completed).length

  // Calculate component scores
  const dpScore = calculateDailyPlanningScore(weekTasks)
  const rhScore = calculateReportHarianScore(weekTasks)
  const woScore = calculateWeeklyObjectiveScore(weekTasks)

  // Calculate total score using the formula: DP40% + RH20% + WO40%
  const totalScore = dpScore * 0.4 + rhScore * 0.2 + woScore * 0.4
  const percentage = Math.min(100, Math.max(0, totalScore))

  // Determine status based on completion and timing
  const status = getWeekStatus(weekTasks, weekEndDate)

  const weekNumber = getWeekNumber(weekStartDate)

  return {
    week: weekNumber,
    status,
    dp: dpScore,
    rh: rhScore,
    wo: woScore,
    total: totalScore,
    percentage,
    tasks: weekTasks,
  }
}

function calculateDailyPlanningScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  // Score based on task creation and planning quality
  const plannedTasks = tasks.filter((task) => task.description && task.estimatedTime)
  const planningRatio = plannedTasks.length / tasks.length

  // Base score from planning ratio, max 40 points
  return Math.round(planningRatio * 40)
}

function calculateReportHarianScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  // Score based on task completion and reporting
  const completedTasks = tasks.filter((task) => task.completed && task.completedAt)
  const reportingRatio = completedTasks.length / tasks.length

  // Base score from reporting ratio, max 20 points
  return Math.round(reportingRatio * 20)
}

function calculateWeeklyObjectiveScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const highPriorityTasks = tasks.filter((task) => task.priority === "high")
  const completedHighPriority = highPriorityTasks.filter((task) => task.completed).length

  // Base completion score
  const completionRatio = completedTasks / totalTasks
  let score = completionRatio * 30 // 30 points for general completion

  // Bonus for high priority completion
  if (highPriorityTasks.length > 0) {
    const highPriorityRatio = completedHighPriority.length / highPriorityTasks.length
    score += highPriorityRatio * 10 // 10 bonus points for high priority
  }

  return Math.round(Math.min(40, score)) // Max 40 points
}

function getWeekStatus(tasks: Task[], weekEndDate: Date): "completed" | "late" | "not_sent" {
  const now = new Date()
  const hasOverdueTasks = tasks.some((task) => !task.completed && new Date(task.deadline) < now)

  if (tasks.length === 0) return "not_sent"
  if (hasOverdueTasks) return "late"
  return "completed"
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
}

export function generateMonthlyData(tasks: Task[], year: number): MonthlyObjectiveData[] {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return months.map((month, monthIndex) => {
    const monthTasks = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate.getFullYear() === year && taskDate.getMonth() === monthIndex
    })

    // Generate weekly data for the month
    const weeklyData = generateWeeklyDataForMonth(monthTasks, year, monthIndex)

    // Calculate monthly scores
    const avgWeeklyScore =
      weeklyData.length > 0 ? weeklyData.reduce((sum, week) => sum + week.percentage, 0) / weeklyData.length : 0

    const staffScore = avgWeeklyScore
    const structuralScore = avgWeeklyScore * 0.8 + getMonthlyObjectiveScore(monthTasks) * 0.2
    const averageScore = (staffScore + structuralScore) / 2

    return {
      month,
      staff: Math.round(staffScore * 100) / 100,
      structural: Math.round(structuralScore * 100) / 100,
      average: Math.round(averageScore * 100) / 100,
      weeklyData,
    }
  })
}

function generateWeeklyDataForMonth(tasks: Task[], year: number, month: number): WeeklyObjectiveData[] {
  const weeks: WeeklyObjectiveData[] = []
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Find the first Sunday of the month or before
  const currentWeekStart = new Date(firstDayOfMonth)
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())

  let weekNumber = 1

  while (currentWeekStart <= lastDayOfMonth) {
    const weekEndDate = new Date(currentWeekStart)
    weekEndDate.setDate(currentWeekStart.getDate() + 6)

    // Only include weeks that have days in the current month
    if (weekEndDate >= firstDayOfMonth) {
      const weekData = calculateWeeklyScore(tasks, currentWeekStart)
      weekData.week = weekNumber
      weeks.push(weekData)
      weekNumber++
    }

    // Move to next week
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }

  return weeks
}

function getMonthlyObjectiveScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  // Calculate monthly objective score based on overall performance
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionRatio = completedTasks / totalTasks

  // Additional factors for monthly score
  const categoryDiversity = new Set(tasks.map((task) => task.category)).size
  const diversityBonus = Math.min(categoryDiversity * 5, 20) // Max 20 bonus points

  const baseScore = completionRatio * 80 // 80 points for completion
  return Math.round(Math.min(100, baseScore + diversityBonus))
}

export function getPerformanceGrade(percentage: number): string {
  if (percentage >= 95) return "A+"
  if (percentage >= 90) return "A"
  if (percentage >= 85) return "B+"
  if (percentage >= 80) return "B"
  return "C"
}

export function getPerformanceColor(percentage: number): string {
  if (percentage >= 95) return "text-green-600"
  if (percentage >= 85) return "text-blue-600"
  if (percentage >= 75) return "text-yellow-600"
  return "text-red-600"
}

export function calculateOverallStats(monthlyData: MonthlyObjectiveData[]) {
  const validMonths = monthlyData.filter((month) => month.weeklyData.length > 0)

  if (validMonths.length === 0) {
    return {
      overallScore: 0,
      weeklyAverage: 0,
      monthlyTarget: 95,
      achievement: "C",
    }
  }

  const totalWeeklyScores = validMonths.flatMap((month) => month.weeklyData.map((week) => week.percentage))

  const overallScore = validMonths.reduce((sum, month) => sum + month.average, 0) / validMonths.length
  const weeklyAverage = totalWeeklyScores.reduce((sum, score) => sum + score, 0) / totalWeeklyScores.length

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    weeklyAverage: Math.round(weeklyAverage * 100) / 100,
    monthlyTarget: 95.0,
    achievement: getPerformanceGrade(overallScore),
  }
}
