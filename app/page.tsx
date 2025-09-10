"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wand2, Video, ImageIcon, Eye, ArrowRight } from "lucide-react"
import { signIn } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // If authenticated, take the user straight to the dashboard
  useEffect(() => {
    if (status === "loading") return
    if (session) router.push("/dashboard")
  }, [session, status, router])

  // While checking auth, render a subtle skeleton to avoid layout shift
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <div className="w-8 h-8 border-2 border-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Public landing page (for unauthenticated users)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-foreground">AI AD Assets</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a className="hover:text-foreground transition-colors" href="#features">Features</a>
            <a className="hover:text-foreground transition-colors" href="#how-it-works">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Sign in
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline + Features + Metrics */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Wand2 className="h-3.5 w-3.5" /> AI‑Powered Creative Suite</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
                Create High 
                <span className="text-foreground">Converting </span>
                <span className="text-yellow-400">Ad</span>{" "}
                <span className="text-yellow-400">Assets</span>{" "}
                <span className="text-rose-500">With AI</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The complete AI creative suite for performance marketers. Edit images, generate videos, and create talking avatars that convert – all with simple text prompts.
              </p>

              {/* Feature chips */}
              <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center"><Wand2 className="h-5 w-5 text-blue-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Smart Image Editing</p>
                    <p className="text-xs text-muted-foreground">AI‑powered photo manipulation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/15 flex items-center justify-center"><Video className="h-5 w-5 text-purple-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Video Generation</p>
                    <p className="text-xs text-muted-foreground">Turn images into cinematic videos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60">
                  <div className="w-10 h-10 rounded-lg bg-pink-600/15 flex items-center justify-center"><ImageIcon className="h-5 w-5 text-pink-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Version Control</p>
                    <p className="text-xs text-muted-foreground">Track and manage iterations</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60">
                  <div className="w-10 h-10 rounded-lg bg-green-600/15 flex items-center justify-center"><Eye className="h-5 w-5 text-green-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Real‑time Preview</p>
                    <p className="text-xs text-muted-foreground">Instant visual feedback</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-10 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10k+</div>
                  <div className="text-xs text-muted-foreground">Images Edited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">5k+</div>
                  <div className="text-xs text-muted-foreground">Videos Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">1k+</div>
                  <div className="text-xs text-muted-foreground">Happy Users</div>
                </div>
              </div>
            </div>

            {/* Right: CTA input */}
            <div className="w-full mx-auto max-w-lg lg:ml-auto">
              <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Create ad creatives in one place..."
                    className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground px-4 py-3 text-sm"
                    readOnly
                  />
                  <Button
                    className="bg-red-600 hover:bg-red-600/90 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  >
                    TRY NOW <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature title="Smart image editing" description="Natural language edits with versioning, powered by AI models." icon="/placeholder-logo.svg" />
            <Feature title="Motion video" description="Cinematic 9:16 video from a single image using Veo3‑Fast via KIE." icon="/placeholder-logo.svg" />
            <Feature title="Talking avatars" description="Lip‑synced avatars with enterprise TTS voices and duration control." icon="/placeholder-logo.svg" />
            <Feature title="Secure by default" description="OAuth via Google, data stored locally during MVP; configurable for cloud." icon="/placeholder-logo.svg" />
            <Feature title="Consistent outputs" description="Deterministic seeds and sensible defaults remove guesswork." icon="/placeholder-logo.svg" />
            <Feature title="Team‑ready" description="Clean UX, gentle learning curve, and minimal cognitive load." icon="/placeholder-logo.svg" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-3 gap-6">
            <Step index={1} title="Upload or paste" description="Start with an existing image or your brand‑approved visuals." />
            <Step index={2} title="Prompt & preview" description="Describe changes in plain English and review instant versions." />
            <Step index={3} title="Publish assets" description="Export images or generate videos/avatars ready for campaigns." />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Start now
            </Button>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-border">Explore features</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Security/Compliance stub */}
      <section id="security" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Enterprise posture</h2>
              <p className="mt-4 text-muted-foreground max-w-prose">
                We follow pragmatic, enterprise‑friendly defaults. OAuth with Google, principle‑of‑least‑privilege, and an audit‑friendly architecture. Single‑tenant and managed deployments are on the roadmap.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-foreground/90">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> OAuth via Google</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Local‑first during MVP</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> API keys kept server‑side</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Export‑ready assets</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-muted-foreground flex items-center justify-between">
          <p>© {new Date().getFullYear()} AI AD Assets. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/auth/signin" className="hover:text-foreground transition-colors">Sign in</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Feature({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-start gap-4">
        <img src={icon} alt="" className="h-6 w-6 opacity-80" />
        <div>
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function Step({ index, title, description }: { index: number; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-sm text-foreground">{index}</div>
        <div>
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}