import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserByEmail } from "@/lib/models/User"
import { getUserTweets } from "@/lib/models/Tweet"
import { getUserAnalytics } from "@/lib/models/Analytics"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get("range") || "7d"

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    // Get user
    const user = await getUserByEmail(db, session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user._id

    // Determine date range
    const now = new Date()
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get tweets in range
    const tweetsRaw = await getUserTweets(db, userId, "posted")
    const tweets = tweetsRaw.filter((t) => t.postedAt && new Date(t.postedAt) >= startDate).sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt))

    const tweetIds = tweets.map((t) => t._id)

    // Get analytics for these tweets
    const analyticsRaw = await getUserAnalytics(db, userId, startDate, now)
    const analyticsMap = analyticsRaw.reduce((acc, a) => {
      if (tweetIds.includes(a.tweetId)) acc[a.tweetId.toString()] = a
      return acc
    }, {})

    // Totals
    const totalImpressions = tweets.reduce((sum, t) => sum + (analyticsMap[t._id.toString()]?.impressions || 0), 0)
    const totalEngagements = tweets.reduce((sum, t) => {
      const a = analyticsMap[t._id.toString()] || {}
      return sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0)
    }, 0)

    // Previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo)
    const previousEndDate = startDate

    const previousTweets = tweetsRaw.filter(
      (t) => t.postedAt && new Date(t.postedAt) >= previousStartDate && new Date(t.postedAt) < previousEndDate
    )
    const previousTweetIds = previousTweets.map((t) => t._id)
    const previousAnalyticsRaw = await getUserAnalytics(db, userId, previousStartDate, previousEndDate)
    const previousAnalyticsMap = previousAnalyticsRaw.reduce((acc, a) => {
      if (previousTweetIds.includes(a.tweetId)) acc[a.tweetId.toString()] = a
      return acc
    }, {})

    const previousImpressions = previousTweets.reduce(
      (sum, t) => sum + (previousAnalyticsMap[t._id.toString()]?.impressions || 0),
      0
    )
    const previousEngagements = previousTweets.reduce((sum, t) => {
      const a = previousAnalyticsMap[t._id.toString()] || {}
      return sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0)
    }, 0)

    const impressionsChange =
      previousImpressions > 0 ? (((totalImpressions - previousImpressions) / previousImpressions) * 100).toFixed(1) : 0
    const engagementsChange =
      previousEngagements > 0 ? (((totalEngagements - previousEngagements) / previousEngagements) * 100).toFixed(1) : 0
    const engagementRate = totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(1) : 0

    // Daily data for chart
    const dailyDataMap = {}
    tweets.forEach((t) => {
      const dateKey = new Date(t.postedAt).toISOString().split("T")[0]
      if (!dailyDataMap[dateKey]) {
        dailyDataMap[dateKey] = { date: dateKey, impressions: 0, engagements: 0, likes: 0, retweets: 0, replies: 0 }
      }
      const a = analyticsMap[t._id.toString()]
      if (a) {
        dailyDataMap[dateKey].impressions += a.impressions || 0
        dailyDataMap[dateKey].likes += a.likes || 0
        dailyDataMap[dateKey].retweets += a.retweets || 0
        dailyDataMap[dateKey].replies += a.replies || 0
        dailyDataMap[dateKey].engagements += (a.likes || 0) + (a.retweets || 0) + (a.replies || 0)
      }
    })
    const chartData = Object.values(dailyDataMap).sort((a, b) => new Date(a.date) - new Date(b.date))

    // Top performing tweets
    const topTweets = tweets
      .map((t) => {
        const a = analyticsMap[t._id.toString()]
        return {
          id: t._id,
          text: t.text,
          impressions: a?.impressions || 0,
          likes: a?.likes || 0,
          retweets: a?.retweets || 0,
          replies: a?.replies || 0,
          engagements: (a?.likes || 0) + (a?.retweets || 0) + (a?.replies || 0),
        }
      })
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalImpressions,
        impressionsChange: Number.parseFloat(impressionsChange),
        totalEngagements,
        engagementsChange: Number.parseFloat(engagementsChange),
        followerCount: 1489, // mock
        followerChange: 239, // mock
        engagementRate: Number.parseFloat(engagementRate),
        engagementRateChange: -2.1, // mock
      },
      chartData,
      topTweets,
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
