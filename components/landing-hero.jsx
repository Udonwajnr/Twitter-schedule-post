"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Twitter, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_50%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              AI-Powered Twitter Growth
            </span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Generate Viral Tweets with{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Magic
            </span>
          </h1>

          {/* Description */}
          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
            Create engaging Twitter content in seconds, schedule posts automatically, and track your growth with
            powerful analytics. Let AI handle your Twitter presence while you focus on what matters.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-base"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 bg-transparent"
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-primary" />
              <span>Join 10,000+ creators boosting their Twitter presence</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 p-4 shadow-2xl shadow-blue-500/10">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center relative overflow-hidden">
              {/* Custom SVG Illustration */}
              <svg
                className="w-full h-full absolute inset-0 opacity-20"
                viewBox="0 0 800 450"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Tweet cards floating */}
                <rect x="50" y="80" width="200" height="120" rx="12" fill="url(#gradient1)" className="animate-float" />
                <rect
                  x="300"
                  y="120"
                  width="200"
                  height="120"
                  rx="12"
                  fill="url(#gradient2)"
                  className="animate-float"
                  style={{ animationDelay: "0.5s" }}
                />
                <rect
                  x="550"
                  y="100"
                  width="200"
                  height="120"
                  rx="12"
                  fill="url(#gradient3)"
                  className="animate-float"
                  style={{ animationDelay: "1s" }}
                />

                {/* Connecting lines */}
                <path
                  d="M 150 200 Q 250 250 350 240"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
                <path
                  d="M 400 240 Q 500 280 650 220"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />

                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 mb-4">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Tweet Generation
                </p>
                <p className="text-sm text-muted-foreground mt-2">Dashboard Preview</p>
              </div>

              {/* Floating stats */}
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">+245%</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="font-semibold text-purple-600 dark:text-purple-400">10K+ Tweets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
