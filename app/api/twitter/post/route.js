import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { getUserById } from "@/lib/models/User"
import { updateTweetStatus } from "@/lib/models/Tweet"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Try to get token from cookies first
    let token = cookies().get("twitter_access_token")?.value

    // If not in cookies, get from database
    if (!token) {
      const mongoClient = await clientPromise
      const db = mongoClient.db("twitboost")
      const user = await getUserById(db, new ObjectId(session.user.id))

      if (!user?.twitterAccessToken) {
        return NextResponse.json({ success: false, error: "Twitter not connected" }, { status: 401 })
      }

      token = user.twitterAccessToken
    }

    const { text, mediaUrls, isThread, threadTweets, tweetId } = await req.json()

    if (!text && !isThread) {
      return NextResponse.json({ success: false, error: "Text required" }, { status: 400 })
    }

    const client = new TwitterApi(token)

    let result

    // Handle thread posting
    if (isThread && threadTweets?.length > 0) {
      const tweets = []
      let previousTweetId = null

      for (const threadText of threadTweets) {
        const tweetData = { text: threadText }
        if (previousTweetId) {
          tweetData.reply = { in_reply_to_tweet_id: previousTweetId }
        }

        const { data } = await client.v2.tweet(tweetData)
        tweets.push(data)
        previousTweetId = data.id
      }

      result = { data: tweets[0], thread: tweets }
    } else {
      // Single tweet
      const { data } = await client.v2.tweet(text)
      result = { data }
    }

    // Update tweet status in database if tweetId provided
    if (tweetId) {
      const mongoClient = await clientPromise
      const db = mongoClient.db("twitboost")
      await updateTweetStatus(db, new ObjectId(tweetId), "posted", result.data.id)
    }

    return NextResponse.json({ success: true, tweet: result.data, thread: result.thread })
  } catch (error) {
    console.error("❌ Tweet post error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
