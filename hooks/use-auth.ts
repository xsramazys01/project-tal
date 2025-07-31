"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication error")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase not configured")
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) throw error
    return data
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}
