import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { getUserById } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log(session)
    if (!session?.user?.email) {
      return NextResponse.json({ user: null, error: "Not authenticated" }, { status: 401 })
    }


    // Try to get token from cookies first
    let token = cookies().get("twitter_access_token")?.value

    // If not in cookies, get from database
    if (!token) {
      const mongoClient = await clientPromise
      const db = mongoClient.db("twitboost")
      const user = await getUserById(db, new ObjectId(session.user.id))

      if (!user?.twitterAccessToken) {
        return NextResponse.json({ user: null, error: "Twitter not connected" })
      }

      token = user.twitterAccessToken
    }

    const client = new TwitterApi(token)
    const { data } = await client.v2.me({
      "user.fields": ["profile_image_url", "username", "public_metrics"],
    })

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("❌ /me error:", error)
    return NextResponse.json({ user: null, error: error.message }, { status: 500 })
  }
}
