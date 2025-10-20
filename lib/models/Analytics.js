// Analytics model schema
export const AnalyticsSchema = {
  name: "analytics",
  fields: {
    _id: "ObjectId",
    userId: "ObjectId (ref: users)",
    date: "Date",
    impressions: "Number",
    engagements: "Number",
    likes: "Number",
    retweets: "Number",
    replies: "Number",
    followers: "Number",
    tweetsPosted: "Number",
    createdAt: "Date",
    updatedAt: "Date",
  },
  indexes: [{ userId: 1, date: 1 }],
}

// Helper functions for analytics operations
export const recordDailyAnalytics = async (db, userId, analyticsData) => {
  const analytics = db.collection("analytics")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return await analytics.updateOne(
    { userId, date: today },
    {
      $set: {
        ...analyticsData,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  )
}

export const getUserAnalytics = async (db, userId, startDate, endDate) => {
  const analytics = db.collection("analytics")
  return await analytics
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: 1 })
    .toArray()
}
