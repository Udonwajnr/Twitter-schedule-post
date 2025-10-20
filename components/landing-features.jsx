import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Calendar, BarChart3, Zap, Clock, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Tweet Generation",
    description: "Generate engaging, on-brand tweets in seconds using advanced AI. Just provide a topic or idea.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description:
      "Schedule tweets for optimal engagement times. Auto-post directly to Twitter without lifting a finger.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track impressions, engagement, and growth with beautiful, actionable analytics.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get tweet suggestions in under 3 seconds. No more staring at a blank screen.",
  },
  {
    icon: Clock,
    title: "Content Calendar",
    description: "Visualize your posting schedule with an intuitive calendar view. Plan weeks ahead.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    description: "Monitor follower growth, engagement rates, and top-performing content over time.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dominate Twitter
            </span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Powerful features designed to save you time and grow your audience
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
