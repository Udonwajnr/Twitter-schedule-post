import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Wand2, Calendar, Rocket } from "lucide-react"

const steps = [
  {
    icon: Lightbulb,
    step: "1",
    title: "Share Your Idea",
    description: "Enter a topic, keyword, or concept you want to tweet about.",
  },
  {
    icon: Wand2,
    step: "2",
    title: "AI Generates Content",
    description: "Our AI creates multiple engaging tweet options tailored to your voice.",
  },
  {
    icon: Calendar,
    step: "3",
    title: "Schedule or Post",
    description: "Choose your favorite, schedule it for later, or post immediately.",
  },
  {
    icon: Rocket,
    step: "4",
    title: "Track & Grow",
    description: "Monitor performance and watch your Twitter presence grow.",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            How It <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">From idea to viral tweet in 4 simple steps</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <Card className="border-border/50 bg-card/50 backdrop-blur text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="mb-2 text-sm font-bold text-primary">STEP {step.step}</div>
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
