import { BillingDashboard } from "@/components/dashboard/billing-dashboard"

export default function BillingPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <BillingDashboard />
    </div>
  )
}
