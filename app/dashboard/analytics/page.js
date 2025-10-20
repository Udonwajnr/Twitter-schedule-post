import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your Twitter performance and growth</p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
