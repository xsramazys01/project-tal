"use client"

import { useState, useEffect } from "react"
import { categoryService } from "@/lib/database"
import type { Category } from "@/lib/supabase"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  // Create category
  const createCategory = async (categoryData: Parameters<typeof categoryService.createCategory>[0]) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData)
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category")
      throw err
    }
  }

  // Update category
  const updateCategory = async (id: string, updates: Parameters<typeof categoryService.updateCategory>[1]) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, updates)
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)))
      return updatedCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category")
      throw err
    }
  }

  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
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
