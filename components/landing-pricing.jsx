import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out TwitBoost AI",
    features: ["5 AI-generated tweets/month", "Basic analytics", "Manual posting", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Basic",
    price: "$5",
    description: "For consistent content creators",
    features: [
      "50 AI-generated tweets/month",
      "Advanced analytics",
      "Auto-scheduling & posting",
      "Content calendar",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$10",
    description: "For serious Twitter growth",
    features: [
      "Unlimited AI-generated tweets",
      "Advanced analytics & insights",
      "Auto-scheduling & posting",
      "Content calendar",
      "Priority support",
      "Custom AI training",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all hover:-translate-y-2 ${
                plan.popular
                  ? "border-blue-500 shadow-2xl shadow-blue-500/20 scale-105"
                  : "border-border/50 hover:border-blue-500/30 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span
                    className={`text-4xl font-bold ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" : ""}`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? "text-blue-600" : "text-primary"}`} />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 7-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}
