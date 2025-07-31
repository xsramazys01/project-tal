import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()

    return {
      ...user,
      profile,
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },

  // Update user profile
  async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("No user found")

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

    return { data, error }
  },
}
