import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"

import {
  getUserByEmail,
} from "@/lib/models/User"

import {
  getUserTweets,
  getScheduledTweets,
} from "@/lib/models/Tweet"

import {
  getUserAnalytics,
} from "@/lib/models/Analytics"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()

    // ✅ Fetch user using helper
    const user = await getUserByEmail(db, session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ Get scheduled tweets
    const allScheduledTweets = await getUserTweets(db, user._id, "scheduled")
    const scheduledTweetsCount = allScheduledTweets.length

    // ✅ Get next scheduled tweet
    const nextScheduledTweet = allScheduledTweets
      .filter(t => t.scheduledFor && new Date(t.scheduledFor) > new Date())
      .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0] || null

    // ✅ Get recent tweets (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentTweets = (await getUserTweets(db, user._id, "posted"))
      .filter(t => t.postedAt && new Date(t.postedAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, 5)

    // ✅ Fetch analytics for recent tweets (you can extend this)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 14)
    const analyticsData = await getUserAnalytics(db, user._id, startDate, new Date())

    const totalEngagement = analyticsData.reduce(
      (sum, a) => sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0),
      0
    )

    // ✅ Compare previous 7 days engagement
    const previousWeek = analyticsData.filter(
      (a) => new Date(a.date) < sevenDaysAgo
    )
    const previousEngagement = previousWeek.reduce(
      (sum, a) => sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0),
      0
    )

    const engagementGrowth =
      previousEngagement > 0
        ? (((totalEngagement - previousEngagement) / previousEngagement) * 100).toFixed(1)
        : 0

    // ✅ Follower growth (mock for now)
    const followerGrowth = 156

    // ✅ Format recent tweets
    const recentTweetsWithAnalytics = recentTweets.map((tweet) => {
      const tweetAnalytics = analyticsData.find(
        (a) => a.tweetId?.toString() === tweet._id?.toString()
      )
      return {
        id: tweet._id,
        text: tweet.text,
        postedAt: tweet.postedAt,
        impressions: tweetAnalytics?.impressions || 0,
        likes: tweetAnalytics?.likes || 0,
        retweets: tweetAnalytics?.retweets || 0,
        replies: tweetAnalytics?.replies || 0,
        engagements:
          (tweetAnalytics?.likes || 0) +
          (tweetAnalytics?.retweets || 0) +
          (tweetAnalytics?.replies || 0),
      }
    })

    return NextResponse.json({
      stats: {
        creditsRemaining: user.credits,
        totalCredits:
          user.plan === "free" ? 10 : user.plan === "basic" ? 50 : 200,
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
