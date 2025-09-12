"use client"

import { signIn, getSession, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Sparkles, Wand2, ImageIcon, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkSession()
  }, [router])

  // Auto-start Google sign-in to avoid an extra step
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      // Trigger Google OAuth immediately
      signIn("google", { callbackUrl: "/dashboard", redirect: true })
    }
  }, [session, status])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">AI-Powered Creative Suite</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Create High-Converting{" "}
              <span className="text-secondary">
                Ad Assets
              </span>{" "}
              With{" "}
              <span className="text-primary">
                AI
              </span>
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl text-foreground max-w-2xl mx-auto lg:mx-0">
              The complete AI creative suite for performance marketers. Edit images, generate videos, and create talking avatars 
              that convert - all with simple text prompts.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">Smart Image Editing</p>
                <p className="text-xs md:text-sm text-muted-foreground">AI-powered photo manipulation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">Video Generation</p>
                <p className="text-xs md:text-sm text-muted-foreground">Turn images into cinematic videos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">Version Control</p>
                <p className="text-xs md:text-sm text-muted-foreground">Track and manage iterations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 text-foreground">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm md:text-base font-medium">Real-time Preview</p>
                <p className="text-xs md:text-sm text-muted-foreground">Instant visual feedback</p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 pt-3 md:pt-4">
            <div className="text-center">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">10k+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Images Edited</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">5k+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Videos Generated</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">1k+</div>
              <div className="text-xs md:text-sm text-muted-foreground">Happy Users</div>
            </div>
          </div>
          
        </div>

        {/* Right side - Hedra-style Chat Interface */}
        <div className="flex justify-center order-1 lg:order-2">
          <div className="w-full max-w-md">
            {!isLoading ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
                <input
                  type="text"
                  placeholder="Create ad creatives in one place..."
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground px-3 md:px-4 py-2 md:py-3 text-sm touch-manipulation"
                  readOnly
                />
                <Button
                  onClick={handleSignIn}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 touch-manipulation"
                >
                  Try now
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-6 shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3 text-foreground">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm md:text-base font-medium">Getting you started...</span>
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center mt-3 md:mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-64 h-64 md:w-96 md:h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 md:-bottom-24 md:-left-24 w-64 h-64 md:w-96 md:h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}