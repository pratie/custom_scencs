"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard")
    } else {
      // User is not authenticated, redirect to sign in
      router.push("/auth/signin")
    }
  }, [session, status, router])

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center text-foreground">
        <div className="w-8 h-8 border-2 border-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    </div>
  )
}