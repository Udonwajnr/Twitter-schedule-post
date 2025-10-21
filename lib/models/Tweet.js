import { ObjectId } from "mongodb"

// Tweet model schema
export const TweetSchema = {
  name: "tweets",
  fields: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    text: "String (required, max 280 chars)",
    status: "String (draft, scheduled, posted, failed)",
    scheduledFor: "Date",
    postedAt: "Date",
    twitterId: "String",
    impressions: "Number",
    likes: "Number",
    retweets: "Number",
    replies: "Number",
    engagements: "Number",
    tone: "String",
    topic: "String",
    createdAt: "Date",
    updatedAt: "Date",
    mediaUrls: "Array (String)",
    isThread: "Boolean",
    threadTweets: "Array (ObjectId)",
    postType: "String (single, thread, poll, quote)",
    cardUri: "String",
    communityId: "String",
    pollOptions: "Array (String)",
    pollDuration: "Number",
    quoteTweetId: "String",
    replyToId: "String",
    replySettings: "String (everyone, mentioned_users, followers)",
    placeId: "String",
    taggedUserIds: "Array (String)",
    nullcast: "Boolean",
    forSuperFollowersOnly: "Boolean",
    shareWithFollowers: "Boolean",
  },
  indexes: [{ userId: 1 }, { status: 1 }, { scheduledFor: 1 }],
}

// Helper functions for tweet operations
export const createTweet = async (db, tweetData) => {
  const tweets = db.collection("tweets")
  const result = await tweets.insertOne({
    ...tweetData,
    status: "draft",
    impressions: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    engagements: 0,
    mediaUrls: [],
    isThread: false,
    threadTweets: [],
    postType: tweetData.postType || "single",
    cardUri: null,
    communityId: null,
    pollOptions: [],
    pollDuration: null,
    quoteTweetId: null,
    replyToId: null,
    replySettings: "everyone",
    placeId: null,
    taggedUserIds: [],
    nullcast: false,
    forSuperFollowersOnly: false,
    shareWithFollowers: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result
}

export const createTweetWithMedia = async (db, tweetData) => {
  const tweets = db.collection("tweets")
  const result = await tweets.insertOne({
    ...tweetData,
    status: tweetData.status || "draft",
    impressions: 0,
    likes: 0,
    retweets: 0,
    replies: 0,
    engagements: 0,
    mediaUrls: tweetData.mediaUrls || [],
    isThread: tweetData.isThread || false,
    threadTweets: tweetData.threadTweets || [],
    postType: tweetData.postType || "single",
    cardUri: tweetData.cardUri || null,
    communityId: tweetData.communityId || null,
    pollOptions: tweetData.pollOptions || [],
    pollDuration: tweetData.pollDuration || null,
    quoteTweetId: tweetData.quoteTweetId || null,
    replyToId: tweetData.replyToId || null,
    replySettings: tweetData.replySettings || "everyone",
    placeId: tweetData.placeId || null,
    taggedUserIds: tweetData.taggedUserIds || [],
    nullcast: tweetData.nullcast || false,
    forSuperFollowersOnly: tweetData.forSuperFollowersOnly || false,
    shareWithFollowers: tweetData.shareWithFollowers || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result
}

export const getUserTweets = async (db, userId, status = null) => {
  const tweets = db.collection("tweets")
  const query = { userId: new ObjectId(userId) }
  if (status) query.status = status
  return await tweets.find(query).sort({ createdAt: -1 }).toArray()
}

export const getScheduledTweets = async (db) => {
  const tweets = db.collection("tweets")
  const now = new Date()
  return await tweets.find({ status: "scheduled", scheduledFor: { $lte: now } }).toArray()
}

export const getTweetById = async (db, tweetId) => {
  const tweets = db.collection("tweets")
  return await tweets.findOne({ _id: new ObjectId(tweetId) })
}

export const updateTweetStatus = async (db, tweetId, status, twitterId = null) => {
  const tweets = db.collection("tweets")
  const update = { status, updatedAt: new Date() }
  if (status === "posted") {
    update.postedAt = new Date()
    if (twitterId) update.twitterId = twitterId
  }
  return await tweets.updateOne({ _id: new ObjectId(tweetId) }, { $set: update })
}

export const updateTweet = async (db, tweetId, updateData) => {
  const tweets = db.collection("tweets")
  return await tweets.updateOne(
    { _id: new ObjectId(tweetId) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
  )
}

export const deleteTweet = async (db, tweetId) => {
  const tweets = db.collection("tweets")
  return await tweets.deleteOne({ _id: new ObjectId(tweetId) })
}

export const findDueForPosting = async (db) => {
  const tweets = db.collection("tweets")
  const users = db.collection("users")
  const now = new Date()
  const dueTweets = await tweets.find({ status: "scheduled", scheduledFor: { $lte: now } }).toArray()

  // Populate user data
  return await Promise.all(
    dueTweets.map(async (tweet) => {
      const user = await users.findOne({ _id: tweet.userId })
      return { ...tweet, user }
    }),
  )
}
