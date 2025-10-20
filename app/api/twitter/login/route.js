import { NextResponse } from "next/server"
import { TwitterApi } from "twitter-api-v2"

export async function GET() {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })

    // Generate the OAuth2 link
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      process.env.TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`,
      { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] },
    )

    // Save verifier + state in cookies for later verification
    const response = NextResponse.redirect(url)
    response.cookies.set("code_verifier", codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    })
    response.cookies.set("state", state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("❌ Twitter login error:", error)
    return NextResponse.json({ error: "Failed to initiate Twitter login", details: error.message }, { status: 500 })
  }
}
