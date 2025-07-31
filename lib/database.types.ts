export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "user" | "admin" | "super_admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "super_admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "super_admin"
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          emoji: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          emoji: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          emoji?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          completed: boolean
          priority: "low" | "medium" | "high"
          deadline: string | null
          day_of_week: number | null
          time_slot: string | null
          is_scheduled: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          completed?: boolean
          priority?: "low" | "medium" | "high"
          deadline?: string | null
          day_of_week?: number | null
          time_slot?: string | null
          is_scheduled?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          completed?: boolean
          priority?: "low" | "medium" | "high"
          deadline?: string | null
          day_of_week?: number | null
          time_slot?: string | null
          is_scheduled?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weekly_focus_goals: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          goal: string
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          goal: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          goal?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string | null
          target_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string | null
          target_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_management: {
        Row: {
          id: string
          user_id: string
          admin_id: string
          action: string
          reason: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          admin_id: string
          action: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          admin_id?: string
          action?: string
          reason?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
