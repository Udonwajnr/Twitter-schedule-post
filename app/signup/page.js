import { SignupForm } from "@/components/auth/signup-form"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TwitBoost AI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start your 7-day free trial today</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-accent to-secondary p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-md text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Start growing your Twitter today</h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed mb-6">
            Get started with 5 free AI-generated tweets. No credit card required.
          </p>
          <ul className="space-y-3 text-primary-foreground/90">
            <li className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              7-day free trial
            </li>
            <li className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              No credit card required
            </li>
            <li className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              Cancel anytime
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
