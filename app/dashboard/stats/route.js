import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import User from "@/lib/models/User"
import Tweet from "@/lib/models/Tweet"
import Analytics from "@/lib/models/Analytics"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get scheduled tweets count
    const scheduledTweetsCount = await Tweet.countDocuments({
      userId: user._id,
      status: "scheduled",
    })

    // Get next scheduled tweet
    const nextScheduledTweet = await Tweet.findOne({
      userId: user._id,
      status: "scheduled",
      scheduledFor: { $gt: new Date() },
    }).sort({ scheduledFor: 1 })

    // Get recent tweets (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentTweets = await Tweet.find({
      userId: user._id,
      status: "posted",
      postedAt: { $gte: sevenDaysAgo },
    })
      .sort({ postedAt: -1 })
      .limit(5)

    // Get analytics for recent tweets
    const recentTweetIds = recentTweets.map((t) => t._id)
    const analytics = await Analytics.find({
      tweetId: { $in: recentTweetIds },
    })

    // Calculate total engagement
    const totalEngagement = analytics.reduce((sum, a) => sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0), 0)

    // Calculate engagement growth (compare with previous 7 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const previousTweets = await Tweet.find({
      userId: user._id,
      status: "posted",
      postedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    })

    const previousTweetIds = previousTweets.map((t) => t._id)
    const previousAnalytics = await Analytics.find({
      tweetId: { $in: previousTweetIds },
    })

    const previousEngagement = previousAnalytics.reduce(
      (sum, a) => sum + (a.likes || 0) + (a.retweets || 0) + (a.replies || 0),
      0,
    )

    const engagementGrowth =
      previousEngagement > 0 ? (((totalEngagement - previousEngagement) / previousEngagement) * 100).toFixed(1) : 0

    // Get follower growth (mock for now - would need Twitter API)
    const followerGrowth = 156 // This would come from Twitter API

    // Format recent tweets with analytics
    const recentTweetsWithAnalytics = recentTweets.map((tweet) => {
      const tweetAnalytics = analytics.find((a) => a.tweetId.toString() === tweet._id.toString())
      return {
        id: tweet._id,
        text: tweet.content,
        postedAt: tweet.postedAt,
        impressions: tweetAnalytics?.impressions || 0,
        likes: tweetAnalytics?.likes || 0,
        retweets: tweetAnalytics?.retweets || 0,
        replies: tweetAnalytics?.replies || 0,
        engagements: (tweetAnalytics?.likes || 0) + (tweetAnalytics?.retweets || 0) + (tweetAnalytics?.replies || 0),
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
              content: nextScheduledTweet.content,
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
