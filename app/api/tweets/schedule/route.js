import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { getTweetById, updateTweet } from "@/lib/models/Tweet"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { tweetId, scheduledFor } = await req.json()

    if (!tweetId || !scheduledFor) {
      return NextResponse.json({ error: "Tweet ID and scheduled time required" }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    // Verify tweet belongs to user
    const tweet = await getTweetById(db, new ObjectId(tweetId))
    if (!tweet || tweet.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Tweet not found or unauthorized" }, { status: 404 })
    }

    await updateTweet(db, new ObjectId(tweetId), {
      scheduledFor: scheduledDate,
      status: "scheduled",
    })

    return NextResponse.json({ success: true, scheduledFor: scheduledDate })
  } catch (error) {
    console.error("❌ Schedule tweet error:", error)
    return NextResponse.json({ error: "Failed to schedule tweet" }, { status: 500 })
  }
}
