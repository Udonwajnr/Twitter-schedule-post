"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Users, Eye, Heart, Repeat2, MessageCircle, Loader2 } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data
const engagementData = [
  { date: "Jan 1", impressions: 1200, engagements: 145, likes: 89, retweets: 34, replies: 22 },
  { date: "Jan 2", impressions: 1450, engagements: 178, likes: 102, retweets: 45, replies: 31 },
  { date: "Jan 3", impressions: 1680, engagements: 203, likes: 125, retweets: 48, replies: 30 },
  { date: "Jan 4", impressions: 1520, engagements: 189, likes: 110, retweets: 52, replies: 27 },
  { date: "Jan 5", impressions: 1890, engagements: 234, likes: 145, retweets: 58, replies: 31 },
  { date: "Jan 6", impressions: 2100, engagements: 267, likes: 167, retweets: 63, replies: 37 },
  { date: "Jan 7", impressions: 2340, engagements: 298, likes: 189, retweets: 71, replies: 38 },
]

const followerGrowthData = [
  { date: "Week 1", followers: 1250 },
  { date: "Week 2", followers: 1320 },
  { date: "Week 3", followers: 1405 },
  { date: "Week 4", followers: 1489 },
]

const topTweets = [
  {
    id: 1,
    text: "Just launched our new feature! Check it out and let us know what you think.",
    impressions: 3450,
    engagements: 456,
    likes: 289,
    retweets: 98,
    replies: 69,
  },
  {
    id: 2,
    text: "Productivity tip: Your morning routine sets the tone for your entire day.",
    impressions: 2890,
    engagements: 378,
    likes: 234,
    retweets: 87,
    replies: 57,
  },
  {
    id: 3,
    text: "Hot take: The best productivity tool isn't an app—it's knowing when to take breaks.",
    impressions: 2650,
    engagements: 342,
    likes: 210,
    retweets: 79,
    replies: 53,
  },
]

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [topTweets, setTopTweets] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/overview?range=${timeRange}`)
      const data = await response.json()

      if (data.stats) {
        setStats(data.stats)
        setChartData(data.chartData || [])
        setTopTweets(data.topTweets || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline">Export Report</Button>
      </div>

      {/* Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalImpressions?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {stats?.impressionsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={stats?.impressionsChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
              >
                {stats?.impressionsChange >= 0 ? "+" : ""}
                {stats?.impressionsChange || 0}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagements</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEngagements?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {stats?.engagementsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={stats?.engagementsChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
              >
                {stats?.engagementsChange >= 0 ? "+" : ""}
                {stats?.engagementsChange || 0}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.followerCount?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+{stats?.followerChange || 0}</span>
              <span className="text-muted-foreground">new followers</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.engagementRate || 0}%</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {stats?.engagementRateChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={stats?.engagementRateChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
              >
                {stats?.engagementRateChange || 0}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>Daily impressions and engagements</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available for this period
              </div>
            ) : (
              <ChartContainer
                config={{
                  impressions: {
                    label: "Impressions",
                    color: "hsl(var(--chart-1))",
                  },
                  engagements: {
                    label: "Engagements",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagements"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
            <CardDescription>Weekly follower count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                followers: {
                  label: "Followers",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={followerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="followers" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Breakdown</CardTitle>
          <CardDescription>Distribution of engagement types</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              likes: {
                label: "Likes",
                color: "hsl(var(--chart-1))",
              },
              retweets: {
                label: "Retweets",
                color: "hsl(var(--chart-2))",
              },
              replies: {
                label: "Replies",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="likes" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retweets" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top performing tweets */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tweets</CardTitle>
          <CardDescription>Your best tweets from this period</CardDescription>
        </CardHeader>
        <CardContent>
          {topTweets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tweets posted in this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topTweets.map((tweet, index) => (
                <div key={tweet.id} className="flex gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-3 leading-relaxed">{tweet.text}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{tweet.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{tweet.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        <span>{tweet.retweets}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{tweet.replies}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium">{tweet.engagements}</div>
                    <div className="text-xs text-muted-foreground">engagements</div>
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
