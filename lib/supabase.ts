import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Validate environment variables with proper fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
    return true
  } catch {
    return false
  }
}

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured() ? createClientComponentClient() : null

// Mock client for development when Supabase is not configured
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      eq: function () {
        return this
      },
      single: function () {
        return this
      },
      order: function () {
        return this
      },
      limit: function () {
        return this
      },
    }),
  }
}

// Get the appropriate client
export const getSupabaseClient = () => {
  return supabase || createMockSupabaseClient()
}

// Database types
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
          suspended: boolean
          suspended_reason: string | null
          suspended_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "super_admin"
          suspended?: boolean
          suspended_reason?: string | null
          suspended_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "super_admin"
          suspended?: boolean
          suspended_reason?: string | null
          suspended_until?: string | null
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
          color?: string
          emoji?: string
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
          title: string
          description: string | null
          category_id: string | null
          priority: "high" | "medium" | "low"
          deadline: string | null
          completed: boolean
          completed_at: string | null
          estimated_time: number | null
          day_of_week: number | null
          is_scheduled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category_id?: string | null
          priority?: "high" | "medium" | "low"
          deadline?: string | null
          completed?: boolean
          completed_at?: string | null
          estimated_time?: number | null
          day_of_week?: number | null
          is_scheduled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          priority?: "high" | "medium" | "low"
          deadline?: string | null
          completed?: boolean
          completed_at?: string | null
          estimated_time?: number | null
          day_of_week?: number | null
          is_scheduled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      weekly_focus_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          completed: boolean
          week_start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          completed?: boolean
          week_start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          completed?: boolean
          week_start_date?: string
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
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: any
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: any
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
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
          target_type: string
          target_id: string | null
          details: any
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id?: string | null
          details?: any
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: string | null
          details?: any
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type WeeklyFocusGoal = Database["public"]["Tables"]["weekly_focus_goals"]["Row"]
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type AdminSetting = Database["public"]["Tables"]["admin_settings"]["Row"]
export type AdminLog = Database["public"]["Tables"]["admin_logs"]["Row"]
