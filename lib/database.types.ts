export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          emoji: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          emoji?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          emoji?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          additional_tasks: number | null
          completed_tasks: number | null
          created_at: string
          id: string
          is_submitted: boolean | null
          planning_score: number | null
          report_date: string
          report_score: number | null
          submitted_at: string | null
          task_score: number | null
          total_tasks: number | null
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          additional_tasks?: number | null
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          planning_score?: number | null
          report_date: string
          report_score?: number | null
          submitted_at?: string | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          additional_tasks?: number | null
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          planning_score?: number | null
          report_date?: string
          report_score?: number | null
          submitted_at?: string | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          description: string | null
          holiday_date: string
          id: string
          is_national: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          holiday_date: string
          id?: string
          is_national?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          holiday_date?: string
          id?: string
          is_national?: boolean | null
          name?: string
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          avg_weekly_tal: number | null
          completed_tasks: number | null
          created_at: string
          id: string
          is_submitted: boolean | null
          month_year: string
          monthly_tal_score: number | null
          planning_score: number | null
          report_score: number | null
          submitted_at: string | null
          task_score: number | null
          total_tasks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_weekly_tal?: number | null
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          month_year: string
          monthly_tal_score?: number | null
          planning_score?: number | null
          report_score?: number | null
          submitted_at?: string | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_weekly_tal?: number | null
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          month_year?: string
          monthly_tal_score?: number | null
          planning_score?: number | null
          report_score?: number | null
          submitted_at?: string | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          suspended: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          suspended?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          suspended?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_by_id: string
          assigned_to_id: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          assigned_by_id: string
          assigned_to_id: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          assigned_by_id?: string
          assigned_to_id?: string
          created_at?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_id_fkey"
            columns: ["assigned_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_locked: boolean | null
          is_reported: boolean | null
          locked_at: string | null
          month_year: string | null
          notes: string | null
          parent_task_id: string | null
          priority: string
          reported_at: string | null
          status: string | null
          target_unit: string | null
          target_value: number | null
          task_date: string | null
          task_type: string
          title: string
          updated_at: string
          user_id: string
          week_start_date: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          is_reported?: boolean | null
          locked_at?: string | null
          month_year?: string | null
          notes?: string | null
          parent_task_id?: string | null
          priority: string
          reported_at?: string | null
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          task_date?: string | null
          task_type: string
          title: string
          updated_at?: string
          user_id: string
          week_start_date?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean | null
          is_reported?: boolean | null
          locked_at?: string | null
          month_year?: string | null
          notes?: string | null
          parent_task_id?: string | null
          priority?: string
          reported_at?: string | null
          status?: string | null
          target_unit?: string | null
          target_value?: number | null
          task_date?: string | null
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          branch: string | null
          created_at: string
          division: string | null
          employee_id: string | null
          full_name: string
          id: string
          join_date: string | null
          must_create_daily: boolean | null
          must_create_monthly: boolean | null
          must_create_weekly: boolean | null
          phone: string | null
          position: string | null
          resign_date: string | null
          status: string | null
          updated_at: string
          user_type: string | null
          username: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          division?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          join_date?: string | null
          must_create_daily?: boolean | null
          must_create_monthly?: boolean | null
          must_create_weekly?: boolean | null
          phone?: string | null
          position?: string | null
          resign_date?: string | null
          status?: string | null
          updated_at?: string
          user_type?: string | null
          username: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          division?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          join_date?: string | null
          must_create_daily?: boolean | null
          must_create_monthly?: boolean | null
          must_create_weekly?: boolean | null
          phone?: string | null
          position?: string | null
          resign_date?: string | null
          status?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_focus_goals: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
          week_start_date: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_focus_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          completed_tasks: number | null
          created_at: string
          id: string
          is_submitted: boolean | null
          month_year: string
          planning_score: number | null
          report_score: number | null
          submitted_at: string | null
          tal_score: number | null
          task_score: number | null
          total_tasks: number | null
          updated_at: string
          user_id: string
          week_number: number
          week_start_date: string
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          month_year: string
          planning_score?: number | null
          report_score?: number | null
          submitted_at?: string | null
          tal_score?: number | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id: string
          week_number: number
          week_start_date: string
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string
          id?: string
          is_submitted?: boolean | null
          month_year?: string
          planning_score?: number | null
          report_score?: number | null
          submitted_at?: string | null
          tal_score?: number | null
          task_score?: number | null
          total_tasks?: number | null
          updated_at?: string
          user_id?: string
          week_number?: number
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// TAL specific types
export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"]

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"]
export type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"]

export type TaskAssignment = Database["public"]["Tables"]["task_assignments"]["Row"]
export type TaskAttachment = Database["public"]["Tables"]["task_attachments"]["Row"]

export type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"]
export type WeeklyReport = Database["public"]["Tables"]["weekly_reports"]["Row"]
export type MonthlyReport = Database["public"]["Tables"]["monthly_reports"]["Row"]

export type Holiday = Database["public"]["Tables"]["holidays"]["Row"]
export type SystemSetting = Database["public"]["Tables"]["system_settings"]["Row"]
