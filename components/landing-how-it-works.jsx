import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Wand2, Calendar, Rocket } from "lucide-react"

const steps = [
  {
    icon: Lightbulb,
    step: "1",
    title: "Share Your Idea",
    description: "Enter a topic, keyword, or concept you want to tweet about.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Wand2,
    step: "2",
    title: "AI Generates Content",
    description: "Our AI creates multiple engaging tweet options tailored to your voice.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    step: "3",
    title: "Schedule or Post",
    description: "Choose your favorite, schedule it for later, or post immediately.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Rocket,
    step: "4",
    title: "Track & Grow",
    description: "Monitor performance and watch your Twitter presence grow.",
    gradient: "from-green-500 to-emerald-500",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">From idea to viral tweet in 4 simple steps</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r ${step.gradient} opacity-30`}
                  />
                )}
                <Card className="group border-border/50 bg-card/50 backdrop-blur text-center transition-all hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="pt-8 pb-6">
                    <div
                      className={`mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div
                      className={`mb-2 text-sm font-bold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}
                    >
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
