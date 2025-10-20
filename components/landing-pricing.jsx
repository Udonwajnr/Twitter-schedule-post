import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
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
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg scale-105" : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" : ""}`}
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
