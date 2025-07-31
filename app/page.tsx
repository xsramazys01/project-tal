"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Target, TrendingUp, Users, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function HomePage() {
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">To-Achieve List</h1>
          </div>
          <div className="flex items-center space-x-4">
            {!supabaseConfigured && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Demo Mode
              </Badge>
            )}
            {supabaseConfigured ? (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <Button disabled>Configure Supabase to Get Started</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Achieve More with
            <span className="text-blue-600"> Smart Planning</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your productivity with our intelligent task management system. Set weekly goals, track progress,
            and achieve your objectives with data-driven insights.
          </p>

          {!supabaseConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">🚀 Setup Required</h3>
              <p className="text-yellow-700 mb-4">
                To use this application, you need to configure Supabase. Update your{" "}
                <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file with your Supabase credentials.
              </p>
              <div className="text-left bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {supabaseConfigured ? (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Button disabled size="lg" className="text-lg px-8 py-3">
                Configure Supabase First
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything You Need to Succeed</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Smart Task Management</CardTitle>
                <CardDescription>
                  Organize tasks by priority, category, and deadlines with intelligent scheduling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Weekly Goal Setting</CardTitle>
                <CardDescription>
                  Set and track weekly objectives with progress monitoring and achievement insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and reports to understand your productivity patterns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Calendar className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>Google Calendar-style weekly view with drag-and-drop task scheduling</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>Visual progress indicators and completion rates to keep you motivated</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive admin panel for user management and system configuration
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">Trusted by Productive People</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Goal Achievement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Achieve Your Goals?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their productivity with our platform.
          </p>

          {supabaseConfigured ? (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Get Started Today
              </Button>
            </Link>
          ) : (
            <Button disabled size="lg" variant="secondary" className="text-lg px-8 py-3">
              Setup Supabase to Continue
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Target className="h-6 w-6" />
              <span className="text-lg font-semibold">To-Achieve List</span>
            </div>
            <div className="text-gray-400">© 2025 To-Achieve List. Built with Next.js and Supabase.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
