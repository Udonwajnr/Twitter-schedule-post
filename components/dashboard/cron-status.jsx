"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle, Zap, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CronStatus() {
  const [lastRun, setLastRun] = useState(null)
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCronLogs()
    // Refresh every 5 minutes
    const interval = setInterval(fetchCronLogs, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchCronLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cron/logs?limit=1")
      const data = await response.json()

      if (data.logs && data.logs.length > 0) {
        setLastRun(data.logs[0])
      }
    } catch (error) {
      console.error("[v0] Error fetching cron logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualTrigger = async () => {
    try {
      setTriggering(true)
      const response = await fetch("/api/cron/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "test-secret"}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Cron job triggered",
          description: `Processed ${data.result.processed} tweets`,
        })
        setLastRun(data.result)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to trigger cron job",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error triggering cron:", error)
      toast({
        title: "Error",
        description: "Failed to trigger cron job",
        variant: "destructive",
      })
    } finally {
      setTriggering(false)
    }
  }

  const getStatusIcon = () => {
    if (!lastRun) return <Clock className="h-5 w-5 text-muted-foreground" />
    if (lastRun.error) return <AlertCircle className="h-5 w-5 text-red-500" />
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }

  const getStatusBadge = () => {
    if (!lastRun) return <Badge variant="outline">Never run</Badge>
    if (lastRun.error) return <Badge variant="destructive">Failed</Badge>
    return (
      <Badge variant="default" className="bg-green-600">
        Success
      </Badge>
    )
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Auto-Post Status
          </CardTitle>
          <CardDescription>Scheduled tweet posting automation</CardDescription>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRun ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="text-lg font-semibold">{getTimeAgo(lastRun.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-lg font-semibold">{lastRun.processed || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success/Failed</p>
                <p className="text-lg font-semibold">
                  <span className="text-green-600">{lastRun.success || 0}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-red-600">{lastRun.failed || 0}</span>
                </p>
              </div>
            </div>

            {lastRun.error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {lastRun.error}
                </p>
              </div>
            )}

            {lastRun.results && lastRun.results.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Results:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {lastRun.results.slice(0, 5).map((result, idx) => (
                    <div key={idx} className="text-xs p-2 rounded bg-muted/50 flex items-center justify-between">
                      <span className="truncate">{result.tweetId}</span>
                      <Badge variant={result.status === "posted" ? "default" : "destructive"}>{result.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No cron runs yet</p>
          </div>
        )}

        <Button
          onClick={handleManualTrigger}
          disabled={triggering || loading}
          className="w-full bg-transparent"
          variant="outline"
        >
          {triggering ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Triggering...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Trigger Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
