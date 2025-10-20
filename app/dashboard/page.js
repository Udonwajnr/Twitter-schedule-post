"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Calendar, Zap, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentTweets, setRecentTweets] = useState([])
  const { data: session } = useSession()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()

      if (data.stats) {
        setStats(data.stats)
        setRecentTweets(data.recentTweets || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeUntilNext = () => {
    if (!stats?.nextScheduledTweet) return "No tweets scheduled"

    const now = new Date()
    const scheduledTime = new Date(stats.nextScheduledTweet.time)
    const diffMs = scheduledTime - now

    if (diffMs < 0) return "Processing..."

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) return `Next post in ${diffHours}h ${diffMins}m`
    return `Next post in ${diffMins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const planName = stats?.plan === "free" ? "Free" : stats?.plan === "basic" ? "Basic" : "Premium"

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your Twitter account today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Remaining</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.creditsRemaining || 0}/{stats?.totalCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{planName} Plan</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tweets Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tweetsScheduled || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeUntilNext()}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagement</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEngagement?.toLocaleString() || 0}</div>
            <p className={`text-xs mt-1 ${stats?.engagementGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats?.engagementGrowth >= 0 ? "+" : ""}
              {stats?.engagementGrowth || 0}% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follower Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.followerGrowth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate New Tweet
            </CardTitle>
            <CardDescription>Create engaging content with AI in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Link href="/dashboard/generate">
                Start Generating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              View Calendar
            </CardTitle>
            <CardDescription>See your scheduled tweets and plan ahead</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/calendar">
                Open Calendar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest tweets and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTweets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent tweets yet. Start generating content!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{tweet.text}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted {new Date(tweet.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tweet.engagements} engagements</p>
                    <p className="text-xs text-muted-foreground">
                      {tweet.likes} likes · {tweet.retweets} retweets
                    </p>
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
