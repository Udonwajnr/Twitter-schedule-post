import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingHowItWorks } from "@/components/landing-how-it-works"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingFooter } from "@/components/landing-footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
