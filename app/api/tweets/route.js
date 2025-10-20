import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import {
  getUserTweets,
  getTweetById,
  deleteTweet,
  updateTweet,
  createTweet,
} from "@/lib/models/Tweet";
import { ObjectId } from "mongodb";

// GET all user tweets
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    const tweets = await getUserTweets(
      db,
      new ObjectId(session.user.id),
      status
    );

    return NextResponse.json({ tweets });
  } catch (error) {
    console.error("❌ Get tweets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}

// POST create a new tweet
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      text,
      status = "draft",
      scheduledFor,
      isThread = false,
      threadTweets = [],
    } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Tweet text required" },
        { status: 400 }
      );
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    const tweetData = {
      userId: new ObjectId(session.user.id),
      text,
      status,
      isThread,
      threadTweets,
    };

    if (scheduledFor) {
      tweetData.scheduledFor = new Date(scheduledFor);
    }

    const tweet = await createTweet(db, tweetData);

    return NextResponse.json({ success: true, tweet });
  } catch (error) {
    console.error("❌ Create tweet error:", error);
    return NextResponse.json(
      { error: "Failed to create tweet" },
      { status: 500 }
    );
  }
}

// DELETE a tweet
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tweetId = searchParams.get("id");

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID required" }, { status: 400 });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    // Verify tweet belongs to user
    const tweet = await getTweetById(db, new ObjectId(tweetId));
    if (!tweet || tweet.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Tweet not found or unauthorized" },
        { status: 404 }
      );
    }

    await deleteTweet(db, new ObjectId(tweetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Delete tweet error:", error);
    return NextResponse.json(
      { error: "Failed to delete tweet" },
      { status: 500 }
    );
  }
}

// PATCH update a tweet
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { tweetId, text, scheduledFor, status } = await req.json();

    if (!tweetId) {
      return NextResponse.json({ error: "Tweet ID required" }, { status: 400 });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("twitboost");

    // Verify tweet belongs to user
    const tweet = await getTweetById(db, new ObjectId(tweetId));
    if (!tweet || tweet.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Tweet not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData = {};
    if (text) updateData.text = text;
    if (scheduledFor) updateData.scheduledFor = new Date(scheduledFor);
    if (status) updateData.status = status;

    await updateTweet(db, new ObjectId(tweetId), updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Update tweet error:", error);
    return NextResponse.json(
      { error: "Failed to update tweet" },
      { status: 500 }
    );
  }
}
