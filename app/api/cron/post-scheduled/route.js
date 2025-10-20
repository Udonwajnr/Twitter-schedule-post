import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import clientPromise from "@/lib/mongodb";
import { getScheduledTweets, updateTweetStatus } from "@/lib/models/Tweet";
import { getUserById } from "@/lib/models/User";

// In-memory cron logs
const cronLogs = [];

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "test-secret";

    // if (authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("twitboost");

    console.log("🔹 Cron job started - fetching scheduled tweets");

    const scheduledTweets = await getScheduledTweets(db);
    console.log(`🔹 Found ${scheduledTweets.length} tweets to post`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const tweet of scheduledTweets) {
      try {
        // Fetch user info to get their Twitter access token
        const user = await getUserById(db, tweet.userId);

        if (!user?.twitterAccessToken) {
          console.error(`⚠️ No Twitter token for user ${tweet.userId}`);
          await updateTweetStatus(db, tweet._id, "failed");
          failureCount++;
          results.push({
            tweetId: tweet._id,
            status: "failed",
            error: "Missing Twitter access token",
          });
          continue;
        }

        const twitterClient = new TwitterApi(user.twitterAccessToken);

        // Post single or thread tweet
        if (tweet.isThread && tweet.threadTweets?.length > 0) {
          console.log(
            `🧵 Posting thread (${tweet.threadTweets.length} tweets)`
          );

          let previousTweetId = null;
          const threadResults = [];

          for (const threadText of tweet.threadTweets) {
            const tweetData = { text: threadText };
            if (previousTweetId) {
              tweetData.reply = { in_reply_to_tweet_id: previousTweetId };
            }

            const { data } = await twitterClient.v2.tweet(tweetData);
            threadResults.push(data);
            previousTweetId = data.id;
          }

          await updateTweetStatus(db, tweet._id, "posted", threadResults[0].id);
          successCount++;
          results.push({
            tweetId: tweet._id,
            status: "posted",
            threadCount: threadResults.length,
          });
        } else {
          console.log(`🐦 Posting single tweet: ${tweet.text.slice(0, 40)}...`);
          const { data } = await twitterClient.v2.tweet({ text: tweet.text });
          await updateTweetStatus(db, tweet._id, "posted", data.id);
          successCount++;
          results.push({
            tweetId: tweet._id,
            status: "posted",
            twitterId: data.id,
          });
        }
      } catch (err) {
        console.error(`❌ Failed to post tweet ${tweet._id}:`, err.message);
        await updateTweetStatus(db, tweet._id, "failed");
        failureCount++;
        results.push({
          tweetId: tweet._id,
          status: "failed",
          error: err.message,
        });
      }
    }

    // Log this cron run
    const logEntry = {
      timestamp: new Date(),
      processed: scheduledTweets.length,
      success: successCount,
      failed: failureCount,
      results,
    };
    cronLogs.unshift(logEntry);
    if (cronLogs.length > 100) cronLogs.pop();

    console.log(
      `✅ Cron completed - ${successCount} posted, ${failureCount} failed`
    );

    return NextResponse.json({
      success: true,
      processed: scheduledTweets.length,
      success: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);

    const logEntry = {
      timestamp: new Date(),
      error: error.message,
      success: false,
    };

    cronLogs.unshift(logEntry);
    if (cronLogs.length > 100) cronLogs.pop();

    return NextResponse.json(
      { error: "Cron job failed", details: error.message },
      { status: 500 }
    );
  }
}

export { cronLogs };
