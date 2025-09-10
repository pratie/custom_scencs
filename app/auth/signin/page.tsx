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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered Creative Suite</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Create High-Converting{" "}
              <span className="text-secondary">
                Ad Assets
              </span>{" "}
              With{" "}
              <span className="text-primary">
                AI
              </span>
            </h1>
            
            <p className="text-xl text-foreground max-w-2xl">
              The complete AI creative suite for performance marketers. Edit images, generate videos, and create talking avatars 
              that convert - all with simple text prompts.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Smart Image Editing</p>
                <p className="text-sm text-muted-foreground">AI-powered photo manipulation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Video Generation</p>
                <p className="text-sm text-muted-foreground">Turn images into cinematic videos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="font-medium">Version Control</p>
                <p className="text-sm text-muted-foreground">Track and manage iterations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium">Real-time Preview</p>
                <p className="text-sm text-muted-foreground">Instant visual feedback</p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10k+</div>
              <div className="text-sm text-muted-foreground">Images Edited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">5k+</div>
              <div className="text-sm text-muted-foreground">Videos Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">1k+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
          </div>
          
        </div>

        {/* Right side - Hedra-style Chat Interface */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {!isLoading ? (
              <div className="flex items-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl">
                <input
                  type="text"
                  placeholder="Create ad creatives in one place..."
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground px-4 py-3 text-sm"
                  readOnly
                />
                <Button
                  onClick={handleSignIn}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  Try now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Getting you started...</span>
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}