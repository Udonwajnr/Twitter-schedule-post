"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
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

export function BillingDashboard() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [userData, setUserData] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, invoicesRes] = await Promise.all([fetch("/api/user/me"), fetch("/api/invoices")])

        const userData = await userRes.json()
        const invoicesData = await invoicesRes.json()

        if (userData.success) {
          setUserData(userData.user)
        }

        if (invoicesData.success) {
          setInvoices(invoicesData.invoices)
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  const currentPlan = userData?.plan || "free"
  const currentPlanName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
  const creditsRemaining = userData?.credits || 0
  const totalCredits = userData?.totalCredits || 5

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Current Plan: {currentPlanName}</CardTitle>
              <CardDescription className="mt-1">
                {currentPlan === "free" ? "Upgrade to unlock more features" : "Your subscription is active"}
              </CardDescription>
            </div>
            <Badge className="bg-primary text-primary-foreground">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {currentPlan === "free" ? "₦0" : currentPlan === "basic" ? "₦5,000" : "₦10,000"}
              </p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            {currentPlan !== "free" && (
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
              </div>
            )}
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
                <span className="text-sm text-muted-foreground">
                  {creditsRemaining} / {totalCredits} remaining
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${(creditsRemaining / totalCredits) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Credits refresh monthly</p>
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
              className={`relative ${plan.name.toLowerCase() === currentPlan ? "border-primary shadow-lg" : "border-border/50"}`}
            >
              {plan.name.toLowerCase() === currentPlan && (
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
                  variant={plan.name.toLowerCase() === currentPlan ? "outline" : "default"}
                  disabled={plan.name.toLowerCase() === currentPlan || isProcessing}
                  onClick={() => handleUpgrade(plan.name, plan.priceValue)}
                >
                  {isProcessing
                    ? "Processing..."
                    : plan.name.toLowerCase() === currentPlan
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

      {/* Billing history */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">₦{invoice.amount.toLocaleString()}</span>
                    <Badge variant={invoice.status === "paid" ? "secondary" : "destructive"}>{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
