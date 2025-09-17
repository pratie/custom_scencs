"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wand2, Video, Rocket, ArrowRight, Sparkles } from "lucide-react"
import { signIn } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (session) router.push("/dashboard")
  }, [session, status, router])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <header className="w-full sticky top-0 z-40 border-b bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">PicoAI</span>
            <span className="hidden sm:inline text-xs font-semibold text-muted-foreground">Your AI Ad Agent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Sign in</Button>
            <Button className="bg-zinc-900 text-white" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-14 md:pt-24 pb-12">
        <div className="container mx-auto px-4 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Powered by FAL • KIE
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-balance">
              Your AI agent for ads that perform
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Edit images, generate motion videos, and launch faster — all from one simple workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button className="bg-zinc-900 text-white" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                Try free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <a href="#pricing"><Button variant="outline">View pricing</Button></a>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-muted-foreground max-w-md">
              <div className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Smart image edits</div>
              <div className="flex items-center gap-2"><Video className="w-4 h-4" /> Motion videos</div>
              <div className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Ship faster</div>
            </div>
          </div>

          {/* Right media area */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="relative mx-auto max-w-xl">
              {/* Image placeholder */}
              <div className="rounded-3xl border bg-white shadow-lg shadow-black/5 overflow-hidden">
                <div className="aspect-video grid place-items-center text-sm text-muted-foreground">
                  <span>Hero image placeholder</span>
                </div>
              </div>
              {/* Overlapping vertical video */}
              <div className="absolute -bottom-8 -right-6 w-40 sm:w-48 md:w-52 rounded-xl border bg-zinc-900 text-white shadow-xl shadow-black/20 overflow-hidden">
                <div className="aspect-[9/16] grid place-items-center text-xs text-zinc-300">
                  <span>Vertical video placeholder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <Image src="/logos/fal.svg" alt="FAL" width={72} height={20} />
            <Image src="/logos/google.svg" alt="Google" width={80} height={24} />
            <Image src="/logos/bytedance.svg" alt="Bytedance" width={90} height={24} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 border-t bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-card">
            <div className="flex items-center gap-2 text-base font-semibold"><Wand2 className="w-4 h-4" /> Edit Images</div>
            <p className="text-sm text-muted-foreground mt-2">Describe the change and watch PicoAI transform your creative with Nano Banana.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card">
            <div className="flex items-center gap-2 text-base font-semibold"><Video className="w-4 h-4" /> Generate Motion</div>
            <p className="text-sm text-muted-foreground mt-2">Turn any image into a vertical video ready for ads. Veo3 powered.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card">
            <div className="flex items-center gap-2 text-base font-semibold"><Rocket className="w-4 h-4" /> Launch Faster</div>
            <p className="text-sm text-muted-foreground mt-2">Keep versions, iterate quickly, and export in seconds.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 bg-gradient-to-b from-white to-zinc-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Upload or start blank", d: "Bring your image or start from a prompt." },
              { n: "2", t: "Describe the change", d: "Use natural language to edit or animate." },
              { n: "3", t: "Export and launch", d: "Download assets and ship your ads." },
            ].map((s) => (
              <div key={s.n} className="p-6 rounded-2xl border bg-card">
                <div className="text-xs font-bold text-muted-foreground">STEP {s.n}</div>
                <div className="mt-1 text-lg font-semibold">{s.t}</div>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 border-t bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-center">Simple pricing</h2>
          <p className="text-center text-muted-foreground mt-2">Start free. Upgrade when you’re ready.</p>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border bg-card">
              <div className="text-sm font-bold">Free</div>
              <div className="text-3xl font-black mt-2">$0</div>
              <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                <li>• Basic image edits</li>
                <li>• Limited generations</li>
              </ul>
              <Button className="mt-6 w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Try Free</Button>
            </div>
            <div className="p-6 rounded-2xl border-2 border-primary bg-card">
              <div className="text-sm font-bold">Creator</div>
              <div className="text-3xl font-black mt-2">$29/mo</div>
              <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                <li>• All image tools</li>
                <li>• Motion video credits</li>
                <li>• Version history</li>
              </ul>
              <Button className="mt-6 w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Get Started</Button>
            </div>
            <div className="p-6 rounded-2xl border bg-card">
              <div className="text-sm font-bold">Pro</div>
              <div className="text-3xl font-black mt-2">$79/mo</div>
              <ul className="mt-4 text-sm text-muted-foreground space-y-2">
                <li>• Higher limits</li>
                <li>• Priority queue</li>
                <li>• Team seats</li>
              </ul>
              <Button className="mt-6 w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Upgrade</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} PicoAI</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
