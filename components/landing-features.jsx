import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Calendar, BarChart3, Zap, Clock, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Tweet Generation",
    description: "Generate engaging, on-brand tweets in seconds using advanced AI. Just provide a topic or idea.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description:
      "Schedule tweets for optimal engagement times. Auto-post directly to Twitter without lifting a finger.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track impressions, engagement, and growth with beautiful, actionable analytics.",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get tweet suggestions in under 3 seconds. No more staring at a blank screen.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Clock,
    title: "Content Calendar",
    description: "Visualize your posting schedule with an intuitive calendar view. Plan weeks ahead.",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    description: "Monitor follower growth, engagement rates, and top-performing content over time.",
    gradient: "from-indigo-500 to-blue-500",
    bgGradient: "from-indigo-500/10 to-blue-500/10",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                className="group border-border/50 bg-card/50 backdrop-blur transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <CardHeader>
                  <div
                    className={`mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.bgGradient} border border-border/50 group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      className={`h-7 w-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}
                      style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text" }}
                    />
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
