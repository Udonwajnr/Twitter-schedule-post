import { TwitterApi } from "twitter-api-v2"

export async function getTwitterClient(accessToken) {
  return new TwitterApi(accessToken)
}

export async function refreshTwitterToken(refreshToken) {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    })

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await client.refreshOAuth2Token(refreshToken)

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    }
  } catch (error) {
    console.error("Failed to refresh Twitter token:", error)
    throw error
  }
}
