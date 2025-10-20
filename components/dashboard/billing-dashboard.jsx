"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Check, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

const plans = [
  {
    name: "Free",
    price: "₦0",
    priceValue: 0,
    credits: 5,
    features: ["5 AI-generated tweets/month", "Basic analytics", "Manual posting", "Community support"],
  },
  {
    name: "Basic",
    price: "₦5,000",
    priceValue: 5000,
    credits: 50,
    features: [
      "50 AI-generated tweets/month",
      "Advanced analytics",
      "Auto-scheduling & posting",
      "Content calendar",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    price: "₦10,000",
    priceValue: 10000,
    credits: 200,
    features: [
      "200 AI-generated tweets/month",
      "Advanced analytics & insights",
      "Auto-scheduling & posting",
      "Content calendar",
      "Priority support",
      "Custom AI training",
      "Team collaboration",
    ],
  },
]

const invoices = [
  { id: "INV-001", date: "Jan 1, 2025", amount: "₦5,000", status: "Paid" },
  { id: "INV-002", date: "Dec 1, 2024", amount: "₦5,000", status: "Paid" },
  { id: "INV-003", date: "Nov 1, 2024", amount: "₦5,000", status: "Paid" },
]

export function BillingDashboard() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const currentPlan = "Basic"

  const handleUpgrade = async (plan, priceValue) => {
    if (priceValue === 0) {
      toast({
        title: "Free plan",
        description: "You're already on the free plan",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.toLowerCase(),
          email: session?.user?.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Payment failed",
          description: data.error || "Failed to initialize payment",
          variant: "destructive",
        })
        return
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Current Plan: {currentPlan}</CardTitle>
              <CardDescription className="mt-1">Your subscription renews on February 1, 2025</CardDescription>
            </div>
            <Badge className="bg-primary text-primary-foreground">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">₦5,000</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline" className="text-destructive bg-transparent">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your credit usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Generation Credits</span>
                <span className="text-sm text-muted-foreground">45 / 50 remaining</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: "90%" }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Resets on February 1, 2025</p>
          </div>
        </CardContent>
      </Card>

      {/* Available plans */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.name === currentPlan ? "border-primary shadow-lg" : "border-border/50"}`}
            >
              {plan.name === currentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>{plan.credits} credits</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.name === currentPlan ? "outline" : "default"}
                  disabled={plan.name === currentPlan || isProcessing}
                  onClick={() => handleUpgrade(plan.name, plan.priceValue)}
                >
                  {isProcessing
                    ? "Processing..."
                    : plan.name === currentPlan
                      ? "Current Plan"
                      : plan.priceValue === 0
                        ? "Downgrade"
                        : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <Badge variant="secondary">{invoice.status}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
