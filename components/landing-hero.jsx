"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Twitter } from "lucide-react"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />

      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Twitter Growth
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Generate Viral Tweets with{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              AI Magic
            </span>
          </h1>

          {/* Description */}
          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
            Create engaging Twitter content in seconds, schedule posts automatically, and track your growth with
            powerful analytics. Let AI handle your Twitter presence while you focus on what matters.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-base">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
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

        {/* Hero Image/Demo */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="mx-auto h-16 w-16 text-primary mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Dashboard Preview Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
