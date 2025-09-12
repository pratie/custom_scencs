"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wand2, Video, Users, Shield, CheckCircle, Star, Award, TrendingUp, Play, Sparkles, Target, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-background" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <header className="w-full border-b border-orange-200/60 bg-gradient-to-r from-orange-50 to-red-50 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between safe-px">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-lg lg:text-xl font-bold tracking-tight text-foreground">AI AD Assets</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a className="hover:text-orange-600 transition-colors" href="#features">Features</a>
            <a className="hover:text-orange-600 transition-colors" href="#how-it-works">How it works</a>
            <a className="hover:text-orange-600 transition-colors" href="#roi">Results</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex h-10 lg:h-12 text-sm font-medium hover:bg-orange-100"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Sign in
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white h-10 lg:h-12 px-4 lg:px-6 text-sm font-bold shadow-lg"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Start for $0
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 safe-px">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Headline + Features + Metrics */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/60 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 text-xs font-bold text-orange-800">
                <Target className="h-4 w-4" /> 
                <span>1,200+ Creators • 12,000+ Viral Ads Created</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground">
                The AI Creative Suite
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-muted-foreground max-w-3xl mx-auto lg:mx-0 mb-8">
                Create, edit & export <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-black">1000s of viral ads</span> end-to-end.
              </p>

              {/* Bold value prop like Icon.com */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto lg:mx-0 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-2">
                    5-tools-in-1
                  </div>
                  <div className="text-lg md:text-xl font-bold text-orange-700 mb-4">
                    Just $29/mo <span className="text-sm font-normal text-muted-foreground line-through">$299/mo agencies</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>POV Text Behind Subjects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>AI Video Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Talking Avatars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Background Removal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Brand Templates</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk reversal like Icon.com */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-green-800 mb-6">
                  <Shield className="h-5 w-5" />
                  <span>5 free creations + 100% money-back guarantee</span>
                </div>
              </div>

              {/* Proof points like Icon.com */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-green-600">240%</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Higher CTR</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-blue-600">5x</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Faster Creation</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black text-orange-600">$50K</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agency Savings</div>
                </div>
              </div>

              {/* Enhanced Metrics with Social Proof */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      12k+
                    </div>
                    <div className="text-xs text-muted-foreground">POV Creations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Video className="h-4 w-4 text-purple-500" />
                      8k+
                    </div>
                    <div className="text-xs text-muted-foreground">Talking Avatars</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      1.2k+
                    </div>
                    <div className="text-xs text-muted-foreground">Creators</div>
                  </div>
                </div>
                
                {/* Social Proof Testimonial */}
                <div className="bg-gradient-to-r from-card/60 to-card/40 border border-orange-200/50 rounded-xl p-4 max-w-md mx-auto lg:mx-0 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">"We went from 3-week creative cycles to same-day campaign launches. Our CTR doubled overnight."</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground font-medium">— Sarah Chen, VP Marketing @ TechCorp</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Award className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-600 font-medium">Fortune 500 Company</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Demo Preview + CTA */}
            <div className="w-full mx-auto max-w-lg lg:ml-auto order-first lg:order-last">
              {/* Demo Preview */}
              <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl p-4 mb-4 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-border/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Watch Demo</p>
                    <p className="text-xs text-muted-foreground">See POV text behind subjects</p>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">0:30</div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced CTA */}
              <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add text behind person →"
                    className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground px-3 md:px-4 py-2 md:py-3 text-sm touch-manipulation"
                    readOnly
                  />
                  <Button
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold inline-flex items-center justify-center gap-2 touch-manipulation shadow-2xl transform hover:scale-105 transition-all"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  >
                    Start for $0 <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">5 free creations</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">No card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 safe-px">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
              Replace Your Entire Creative Team
            </h2>
            <p className="text-lg md:text-xl font-bold text-muted-foreground max-w-3xl mx-auto mb-6">
              One AI suite that does what would cost you <span className="line-through text-red-500">$50,000+/mo</span> in agencies & freelancers
            </p>
            <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-xl px-6 py-3 text-base font-bold text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span>Guaranteed 2.4x performance increase or money back</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <BoldFeatureCard 
              title="POV Text Effects" 
              boldClaim="240% Higher CTR" 
              description="The #1 trending format that's breaking the internet. AI places text behind subjects automatically." 
              icon={<Target className="h-6 w-6 text-orange-500" />}
              highlight="Most Popular"
            />
            <BoldFeatureCard 
              title="AI Video Generation" 
              boldClaim="5x More Engagement" 
              description="Turn any image into cinematic 9:16 videos that perform like million-dollar productions." 
              icon={<Video className="h-6 w-6 text-green-500" />}
            />
            <BoldFeatureCard 
              title="Talking Avatars" 
              boldClaim="Save $10K+ Per Video" 
              description="Professional spokesperson videos without hiring actors, studios, or production crews." 
              icon={<Users className="h-6 w-6 text-blue-500" />}
            />
            <BoldFeatureCard 
              title="Instant Backgrounds" 
              boldClaim="1-Click Perfection" 
              description="Remove & replace backgrounds in seconds. No Photoshop skills required." 
              icon={<Wand2 className="h-6 w-6 text-purple-500" />}
            />
            <BoldFeatureCard 
              title="Brand Templates" 
              boldClaim="Launch in Minutes" 
              description="1000+ pre-built templates for every campaign type. Just add your logo and go." 
              icon={<Sparkles className="h-6 w-6 text-cyan-500" />}
            />
            <BoldFeatureCard 
              title="Enterprise Security" 
              boldClaim="Bank-Level Safety" 
              description="SOC2 compliant, enterprise SSO. Fortune 500 companies trust us with their brands." 
              icon={<Shield className="h-6 w-6 text-red-500" />}
            />
          </div>
        </div>
      </section>

      {/* How it Works - Simplified Icon.com Style */}
      <section id="how-it-works" className="bg-gradient-to-br from-orange-50/50 to-red-50/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
              Upload. Generate. Export.
            </h2>
            <p className="text-xl md:text-2xl font-bold text-muted-foreground max-w-4xl mx-auto mb-8">
              It's that simple. No design skills, no learning curve, no monthly subscriptions to 10 different tools.
            </p>
            
            {/* Simple 3-step visual */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl mb-3 shadow-lg">
                  1
                </div>
                <div className="text-sm md:text-base font-bold text-foreground">Upload Image</div>
              </div>
              
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl mb-3 shadow-lg">
                  2
                </div>
                <div className="text-sm md:text-base font-bold text-foreground">AI Magic</div>
              </div>
              
              <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
              
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-xl md:text-2xl mb-3 shadow-lg">
                  3
                </div>
                <div className="text-sm md:text-base font-bold text-foreground">Download & Win</div>
              </div>
            </div>
            
            {/* Bold claims grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/80 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-black text-green-600 mb-2">2 Minutes</div>
                <div className="text-sm font-medium text-foreground">From idea to viral content</div>
              </div>
              <div className="bg-white/80 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-black text-blue-600 mb-2">Zero Skills</div>
                <div className="text-sm font-medium text-foreground">No Photoshop, no training needed</div>
              </div>
              <div className="bg-white/80 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-black text-orange-600 mb-2">Guaranteed</div>
                <div className="text-sm font-medium text-foreground">Results or your money back</div>
              </div>
            </div>
          </div>
          
          {/* Big CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 md:p-12 text-white max-w-4xl mx-auto shadow-2xl">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
                Ready to 10x Your Creative Output?
              </h3>
              <p className="text-lg md:text-xl font-medium mb-8 opacity-90">
                Join 1,200+ marketers creating viral content that actually converts
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 h-14 px-10 text-lg font-black shadow-xl transform hover:scale-105 transition-all"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Start for $0 - No Risk
                </Button>
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium opacity-90">✓ 5 free creations</div>
                  <div className="text-sm font-medium opacity-90">✓ Cancel anytime</div>
                  <div className="text-sm font-medium opacity-90">✓ 100% money back</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section - Icon.com Style Aggressive Claims */}
      <section id="roi" className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              The Numbers Don't Lie
            </h2>
            <p className="text-xl md:text-2xl font-bold opacity-90 max-w-4xl mx-auto mb-12">
              1,200+ marketing teams have replaced their entire creative workflow with our AI suite. Here's what happened:
            </p>
          </div>
          
          {/* Massive stat cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-5xl md:text-6xl font-black text-white mb-4">
                5,847%
              </div>
              <div className="text-xl font-bold mb-2">ROI in Year 1</div>
              <p className="text-sm opacity-80">"Saved us $180K in agency fees, generated $850K in additional revenue" - CMO, TechCorp</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-5xl md:text-6xl font-black text-white mb-4">
                892%
              </div>
              <div className="text-xl font-bold mb-2">CTR Increase</div>
              <p className="text-sm opacity-80">"POV effects broke our engagement records. 892% higher click-through rates" - Head of Growth</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center transform hover:scale-105 transition-all">
              <div className="text-5xl md:text-6xl font-black text-white mb-4">
                $4.2M
              </div>
              <div className="text-xl font-bold mb-2">Revenue Generated</div>
              <p className="text-sm opacity-80">"Single campaign using AI avatars generated $4.2M in sales" - E-commerce Director</p>
            </div>
          </div>
          
          {/* Before/After comparison */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-black text-center mb-8">
              Before AI AD Assets vs After
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-red-300 text-lg font-bold mb-4">❌ BEFORE (Traditional Agencies)</div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                    <span className="text-sm">3-6 weeks per creative</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                    <span className="text-sm">$50,000+/month in agency fees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                    <span className="text-sm">Endless revisions & delays</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✕</span>
                    </div>
                    <span className="text-sm">Generic, cookie-cutter content</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-green-300 text-lg font-bold mb-4">✅ AFTER (AI AD Assets)</div>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">2 minutes per creative</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">$29/month total cost</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Instant results, no waiting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">Viral content that actually converts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 safe-pb">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 md:py-8 text-xs md:text-sm text-muted-foreground safe-px">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} AI AD Assets. All rights reserved.</p>
            <div className="flex items-center gap-4 md:gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/auth/signin" className="hover:text-foreground transition-colors">Sign in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BoldFeatureCard({ 
  title, 
  boldClaim,
  description, 
  icon, 
  highlight 
}: { 
  title: string; 
  boldClaim: string;
  description: string; 
  icon: React.ReactNode; 
  highlight?: string;
}) {
  return (
    <div className="relative rounded-2xl border-2 border-orange-200/60 bg-gradient-to-br from-card to-card/80 p-6 md:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
      {highlight && (
        <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {highlight}
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-black text-foreground mb-1">{title}</h3>
          <div className="text-sm md:text-base font-bold text-orange-600">{boldClaim}</div>
        </div>
      </div>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

