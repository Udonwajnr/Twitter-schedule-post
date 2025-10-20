import { SettingsDashboard } from "@/components/dashboard/settings-dashboard"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <SettingsDashboard />
    </div>
  )
}
