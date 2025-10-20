import { ContentCalendar } from "@/components/dashboard/content-calendar"

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
        <p className="text-muted-foreground">View and manage your scheduled tweets</p>
      </div>

      <ContentCalendar />
    </div>
  )
}
