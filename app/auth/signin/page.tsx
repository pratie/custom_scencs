"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Sparkles, Wand2, ImageIcon, Play, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
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
              Transform Your{" "}
              <span className="text-secondary">
                Images
              </span>{" "}
              Into{" "}
              <span className="text-primary">
                Videos
              </span>
            </h1>
            
            <p className="text-xl text-foreground max-w-2xl">
              Create stunning visual content with our AI-powered image editing and video generation platform. 
              Edit images with natural language prompts and bring them to life with cinematic videos.
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
                <Play className="w-5 h-5 text-green-400" />
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

        {/* Right side - Sign in card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-card/90 backdrop-blur-xl border-border shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-foreground" />
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welcome to v0 Images
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Sign in to start creating amazing visual content with AI
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium text-base relative overflow-hidden transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
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