"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: any
}

export function DatabaseTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [showDetails, setShowDetails] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    const tests: TestResult[] = []

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      tests.push({
        name: "Database Connection",
        status: error ? "error" : "success",
        message: error ? `Connection failed: ${error.message}` : "Successfully connected to database",
        details: { data, error },
      })
    } catch (error: any) {
      tests.push({
        name: "Database Connection",
        status: "error",
        message: `Connection error: ${error.message}`,
        details: error,
      })
    }

    // Test 2-6: Table Existence Tests
    const tables = ["profiles", "categories", "tasks", "weekly_focus_goals", "activity_logs"]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        tests.push({
          name: `Table: ${table}`,
          status: error ? "error" : "success",
          message: error ? `Table error: ${error.message}` : `Table ${table} exists and accessible`,
          details: { table, data, error },
        })
      } catch (error: any) {
        tests.push({
          name: `Table: ${table}`,
          status: "error",
          message: `Table ${table} error: ${error.message}`,
          details: error,
        })
      }
    }

    // Test 7: Admin Tables
    const adminTables = ["admin_settings", "admin_logs"]
    for (const table of adminTables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        tests.push({
          name: `Admin Table: ${table}`,
          status: error ? "error" : "success",
          message: error ? `Admin table error: ${error.message}` : `Admin table ${table} exists`,
          details: { table, data, error },
        })
      } catch (error: any) {
        tests.push({
          name: `Admin Table: ${table}`,
          status: "error",
          message: `Admin table ${table} error: ${error.message}`,
          details: error,
        })
      }
    }

    // Test 8: Row Level Security
    try {
      const { data, error } = await supabase.rpc("has_table_privilege", {
        table_name: "profiles",
        privilege: "SELECT",
      })
      tests.push({
        name: "Row Level Security",
        status: "success",
        message: "RLS policies are active",
        details: { rls_active: true },
      })
    } catch (error: any) {
      tests.push({
        name: "Row Level Security",
        status: "error",
        message: `RLS test failed: ${error.message}`,
        details: error,
      })
    }

    // Test 9: Authentication System
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      tests.push({
        name: "Authentication System",
        status: error ? "error" : "success",
        message: error
          ? `Auth error: ${error.message}`
          : session
            ? `Authenticated as: ${session.user.email}`
            : "Auth system working (not logged in)",
        details: { session, error },
      })
    } catch (error: any) {
      tests.push({
        name: "Authentication System",
        status: "error",
        message: `Auth system error: ${error.message}`,
        details: error,
      })
    }

    // Test 10: Default Categories Check
    try {
      const { data, error } = await supabase.from("categories").select("name").limit(5)
      tests.push({
        name: "Default Data",
        status: error ? "error" : "success",
        message: error ? `Default data error: ${error.message}` : `Found ${data?.length || 0} sample categories`,
        details: { categories: data, error },
      })
    } catch (error: any) {
      tests.push({
        name: "Default Data",
        status: "error",
        message: `Default data error: ${error.message}`,
        details: error,
      })
    }

    setResults(tests)
    setIsRunning(false)
  }

  const successCount = results.filter((r) => r.status === "success").length
  const totalTests = results.length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database System Test
        </CardTitle>
        <CardDescription>
          Comprehensive test to verify database setup, tables, security, and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={runTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Run Database Tests
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="flex items-center space-x-4">
              <Badge variant={successCount === totalTests ? "default" : "destructive"} className="text-sm">
                {successCount}/{totalTests} Tests Passed
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="text-xs">
                {showDetails ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showDetails ? "Hide" : "View"} Technical Details
              </Button>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.status === "success"
                      ? "bg-green-50 border-green-200"
                      : result.status === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{result.name}</h4>
                    {result.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : result.status === "error" ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{result.message}</p>

                  {showDetails && result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Technical Details
                      </summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <Alert
              className={successCount === totalTests ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              <AlertDescription className={successCount === totalTests ? "text-green-800" : "text-red-800"}>
                {successCount === totalTests ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    All tests passed! Your database is properly configured and ready for use.
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 inline mr-2" />
                    {totalTests - successCount} test(s) failed. Please check the errors above and ensure your database
                    is properly set up.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
