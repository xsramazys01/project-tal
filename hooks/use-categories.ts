"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Category {
  id: string
  name: string
  color: string
  emoji: string
  user_id: string
  created_at: string
  updated_at: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })

      if (error) throw error

      setCategories(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  // Create category
  const createCategory = async (categoryData: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          ...categoryData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category")
      throw err
    }
  }

  // Update category
  const updateCategory = async (
    id: string,
    updates: Partial<Omit<Category, "id" | "user_id" | "created_at" | "updated_at">>,
  ) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => prev.map((cat) => (cat.id === id ? data : cat)))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category")
      throw err
    }
  }

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      setCategories((prev) => prev.filter((cat) => cat.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category")
      throw err
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories,
  }
}
