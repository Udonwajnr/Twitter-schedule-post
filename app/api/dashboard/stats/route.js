import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserByEmail } from "@/lib/models/User"
import { getUserTweets } from "@/lib/models/Tweet"
import { getUserAnalytics } from "@/lib/models/Analytics"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    // Fetch user
    const user = await getUserByEmail(db, session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user._id

    // Scheduled tweets count
    const scheduledTweets = await getUserTweets(db, userId, "scheduled")
    const scheduledTweetsCount = scheduledTweets.length

    // Next scheduled tweet
    const futureScheduledTweets = scheduledTweets.filter((t) => t.scheduledFor && new Date(t.scheduledFor) > new Date())
    const nextScheduledTweet = futureScheduledTweets.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0] || null

    // Recent tweets (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentTweetsRaw = await getUserTweets(db, userId, "posted")
    const recentTweets = recentTweetsRaw
      .filter((t) => t.postedAt && new Date(t.postedAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, 5)

    // Analytics for recent tweets
    const recentTweetIds = recentTweets.map((t) => t._id)
    const analyticsRaw = await getUserAnalytics(db, userId, new Date(0), new Date())
    const analyticsMap = analyticsRaw.reduce((acc, a) => {
      if (recentTweetIds.includes(a.tweetId)) acc[a.tweetId.toString()] = a
      return acc
    }, {})

    const totalEngagement = recentTweets.reduce((sum, t) => {
      const a = analyticsMap[t._id.toString()] || {}
      return sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0)
    }, 0)

    // Engagement growth (previous 7 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const previousTweets = recentTweetsRaw.filter(
      (t) => t.postedAt && new Date(t.postedAt) >= fourteenDaysAgo && new Date(t.postedAt) < sevenDaysAgo
    )
    const previousTweetIds = previousTweets.map((t) => t._id)
    const previousEngagement = analyticsRaw
      .filter((a) => previousTweetIds.includes(a.tweetId))
      .reduce((sum, a) => sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0), 0)

    const engagementGrowth = previousEngagement > 0 ? (((totalEngagement - previousEngagement) / previousEngagement) * 100).toFixed(1) : 0

    // Follower growth (mock)
    const followerGrowth = 156

    // Format recent tweets with analytics
    const recentTweetsWithAnalytics = recentTweets.map((t) => {
      const a = analyticsMap[t._id.toString()] || {}
      const engagements = (a.likes || 0) + (a.retweets || 0) + (a.replies || 0)
      return {
        id: t._id,
        text: t.text,
        postedAt: t.postedAt,
        impressions: a.impressions || 0,
        likes: a.likes || 0,
        retweets: a.retweets || 0,
        replies: a.replies || 0,
        engagements,
      }
    })

    return NextResponse.json({
      stats: {
        creditsRemaining: user.credits,
        totalCredits: user.plan === "free" ? 10 : user.plan === "basic" ? 50 : 200,
        plan: user.plan,
        tweetsScheduled: scheduledTweetsCount,
        nextScheduledTweet: nextScheduledTweet
          ? {
              time: nextScheduledTweet.scheduledFor,
              content: nextScheduledTweet.text,
            }
          : null,
        totalEngagement,
        engagementGrowth: Number.parseFloat(engagementGrowth),
        followerGrowth,
      },
      recentTweets: recentTweetsWithAnalytics,
    })
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
