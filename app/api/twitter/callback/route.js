import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import {
  updateUserTwitterTokens,
  updateUserTwitterProfile,
  getUserByEmail,
} from "@/lib/models/User";

export async function GET(req) {
  console.log("🔹 Twitter callback triggered");

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("code:", code);
    console.log("state:", state);

    const cookieStore = cookies();
    const savedVerifier = cookieStore.get("code_verifier")?.value;
    const savedState = cookieStore.get("state")?.value;

    console.log("savedVerifier:", savedVerifier);
    console.log("savedState:", savedState);

    if (!code || !state || state !== savedState) {
      console.warn("❌ Invalid state or missing code");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=invalid_state`
      );
    }

    // Twitter OAuth client
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    let loggedClient, accessToken, refreshToken, expiresIn;
    try {
      const result = await client.loginWithOAuth2({
        code,
        codeVerifier: savedVerifier,
        redirectUri:
          process.env.TWITTER_REDIRECT_URI ||
          `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`,
      });

      loggedClient = result.client;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;

      console.log("✅ Twitter OAuth success", {
        accessToken,
        refreshToken,
        expiresIn,
      });
    } catch (err) {
      console.error("❌ Twitter OAuth error:", err);
      throw err;
    }

    // Fetch Twitter user info
    let twitterUser;
    try {
      const { data } = await loggedClient.v2.me({
        "user.fields": ["profile_image_url", "username"],
      });
      console.log(data,"this is just me testing")
      twitterUser = data;
      console.log("✅ Twitter user fetched:", twitterUser);
    } catch (err) {
      console.error("❌ Failed to fetch Twitter user:", err);
      throw err;
    }

    // Get NextAuth session
    const session = await getServerSession(authOptions);
    console.log("session:", session);

    if (!session?.user?.email) {
      console.warn("❌ No session found");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_session`
      );
    }

    // Get user from DB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    const user = await getUserByEmail(db, session.user.email);
    if (!user) {
      console.error("❌ User not found in DB");
      throw new Error("User not found");
    }
    console.log("✅ User found in DB:", user._id);

    // Save tokens and profile
    await updateUserTwitterTokens(db, user._id, accessToken, refreshToken, expiresIn);
    await updateUserTwitterProfile(db, user._id, twitterUser);
    console.log("✅ Tokens and profile saved to DB");

    // Prepare redirect response
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=twitter_connected`
    );

    // Save access tokens in cookies
    response.cookies.set("twitter_access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });
    response.cookies.set("twitter_refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Clear OAuth state cookies
    response.cookies.delete("code_verifier");
    response.cookies.delete("state");

    console.log("🔹 Redirecting to settings with success");
    return response;
  } catch (error) {
    console.error("❌ Twitter callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=oauth_failed&msg=${encodeURIComponent(
        error.message
      )}`
    );
  }
}
