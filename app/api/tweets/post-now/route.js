import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { tweetId, text, isThread, threadTweets } = await req.json()

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID required" }, { status: 400 })
    }

    // Call the Twitter post API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({ text, isThread, threadTweets, tweetId }),
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: response.status })
    }

    return NextResponse.json({ success: true, tweet: data.tweet })
  } catch (error) {
    console.error("❌ Post now error:", error)
    return NextResponse.json({ error: "Failed to post tweet" }, { status: 500 })
  }
}
