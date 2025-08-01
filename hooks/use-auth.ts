"use client"

import { useState, useEffect, useCallback } from "react"
import type { User, AuthError } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export interface AuthState {
  user: User | null
  loading: boolean
  error: AuthError | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, loading: false, error: null })
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        setState({ user: session?.user ?? null, loading: false, error: null })
      } catch (error) {
        setState({ user: null, loading: false, error: error as AuthError })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState({ user: session?.user ?? null, loading: false, error: null })

      if (event === "SIGNED_IN") {
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured")
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
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

      setState((prev) => ({ ...prev, loading: false }))
      return data
    } catch (error) {
      const authError = error as AuthError
      setState((prev) => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured")
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setState((prev) => ({ ...prev, loading: false }))
      return data
    } catch (error) {
      const authError = error as AuthError
      setState((prev) => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured")
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      const authError = error as AuthError
      setState((prev) => ({ ...prev, error: authError }))
      throw authError
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setState({ user: null, loading: false, error: null })
    } catch (error) {
      const authError = error as AuthError
      setState((prev) => ({ ...prev, loading: false, error: authError }))
      throw authError
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured")
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return data
    } catch (error) {
      const authError = error as AuthError
      throw authError
    }
  }, [])

  return {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  }
}
