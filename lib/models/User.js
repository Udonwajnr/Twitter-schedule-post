// User model schema
export const UserSchema = {
  name: "users",
  fields: {
    _id: "ObjectId",
    name: "String",
    email: "String (unique, required)",
    password: "String (hashed)",
    avatar: "String (URL)",
    bio: "String",
    plan: "String (free, basic, premium)",
    credits: "Number",
    totalCredits: "Number",
    stripeCustomerId: "String",
    stripeSubscriptionId: "String",
    twitterId: "String",
    twitterUsername: "String",
    twitterAccessToken: "String",
    twitterRefreshToken: "String",
    twitterTokenExpiresAt: "Date",
    emailNotifications: "Boolean",
    autoPost: "Boolean",
    createdAt: "Date",
    updatedAt: "Date",
  },
  indexes: [{ email: 1 }, { twitterId: 1 }],
}

// Helper functions for user operations
export const createUser = async (db, userData) => {
  const users = db.collection("users")
  const result = await users.insertOne({
    ...userData,
    plan: "free",
    credits: 5,
    totalCredits: 5,
    emailNotifications: true,
    autoPost: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result
}

export const getUserByEmail = async (db, email) => {
  const users = db.collection("users")
  return await users.findOne({ email })
}

export const updateUserCredits = async (db, userId, creditsUsed) => {
  const users = db.collection("users")
  return await users.updateOne({ _id: userId }, { $inc: { credits: -creditsUsed }, $set: { updatedAt: new Date() } })
}

export const updateUserTwitterTokens = async (db, userId, accessToken, refreshToken, expiresIn) => {
  const users = db.collection("users")
  return await users.updateOne(
    { _id: userId },
    {
      $set: {
        twitterAccessToken: accessToken,
        twitterRefreshToken: refreshToken,
        twitterTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        updatedAt: new Date(),
      },
    },
  )
}

export const getUserByTwitterId = async (db, twitterId) => {
  const users = db.collection("users")
  return await users.findOne({ twitterId })
}

export const updateUserTwitterProfile = async (db, userId, twitterData) => {
  const users = db.collection("users")
  return await users.updateOne(
    { _id: userId },
    {
      $set: {
        twitterId: twitterData.id,
        twitterUsername: twitterData.username,
        avatar: twitterData.profile_image_url || null,
        updatedAt: new Date(),
      },
    },
  )
}

export const getUserById = async (db, userId) => {
  const users = db.collection("users")
  return await users.findOne({ _id: userId })
}

export const refreshUserCredits = async (db, userId, plan) => {
  const users = db.collection("users")
  const creditLimits = {
    free: 5,
    basic: 50,
    premium: 200,
  }
  return await users.updateOne(
    { _id: userId },
    {
      $set: {
        credits: creditLimits[plan] || 5,
        totalCredits: creditLimits[plan] || 5,
        updatedAt: new Date(),
      },
    },
  )
}
