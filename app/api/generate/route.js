import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { getUserById, updateUserCredits } from "@/lib/models/User"
import { createTweetWithMedia } from "@/lib/models/Tweet"
import { ObjectId } from "mongodb"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { topic, tone, count = 3 } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    // Check user credits
    const user = await getUserById(db, new ObjectId(session.user.id))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const creditsNeeded = count
    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        { error: "Insufficient credits", creditsNeeded, creditsAvailable: user.credits },
        { status: 403 },
      )
    }

    // Generate tweets using Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Generate ${count} unique, engaging tweets about "${topic}" with a ${tone || "professional"} tone. 
    Each tweet should be:
    - Maximum 280 characters
    - Engaging and authentic
    - Include relevant hashtags where appropriate
    - Be unique from each other
    
    Return ONLY a JSON array of tweet texts, nothing else. Format: ["tweet1", "tweet2", "tweet3"]`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    let tweets
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      tweets = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", text)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    if (!Array.isArray(tweets) || tweets.length === 0) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 })
    }

    // Save generated tweets to database
    const savedTweets = []
    for (const tweetText of tweets) {
      const tweetData = {
        userId: new ObjectId(session.user.id),
        text: tweetText,
        tone: tone || "professional",
        topic,
        status: "draft",
      }
      const result = await createTweetWithMedia(db, tweetData)
      savedTweets.push({
        id: result.insertedId.toString(),
        text: tweetText,
        status: "draft",
      })
    }

    // Deduct credits
    await updateUserCredits(db, new ObjectId(session.user.id), creditsNeeded)

    return NextResponse.json({
      success: true,
      tweets: savedTweets,
      creditsUsed: creditsNeeded,
      creditsRemaining: user.credits - creditsNeeded,
    })
  } catch (error) {
    console.error("❌ Generate error:", error)
    return NextResponse.json({ error: "Failed to generate tweets", details: error.message }, { status: 500 })
  }
}
