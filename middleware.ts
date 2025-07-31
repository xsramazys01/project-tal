import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isSupabaseConfigured } from "./lib/supabase"

export async function middleware(req: NextRequest) {
  // If Supabase is not configured, allow access to all pages except protected routes
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured - running in development mode")

    // Block access to protected routes when Supabase is not configured
    if (
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/analytics") ||
      req.nextUrl.pathname.startsWith("/mobile")
    ) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  }

  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth error in middleware:", error)
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Admin routes protection
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, suspended")
        .eq("id", session.user.id)
        .single()

      if (!profile || profile.suspended || !["admin", "super_admin"].includes(profile.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Protected routes (dashboard, analytics, mobile)
    const protectedRoutes = ["/dashboard", "/analytics", "/mobile"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Auth routes (login, register)
    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Root redirect
    if (req.nextUrl.pathname === "/") {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      // Don't redirect to login if Supabase is not configured
      return NextResponse.next()
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, redirect to home page
    return NextResponse.redirect(new URL("/", req.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
