import { NextResponse } from "next/server"
import crypto from "crypto"
import clientPromise from "@/lib/mongodb"
import { refreshUserCredits } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle subscription events
    if (event.event === "subscription.create" || event.event === "charge.success") {
      const { metadata } = event.data
      const { userId, plan } = metadata

      if (userId && plan) {
        const mongoClient = await clientPromise
        const db = mongoClient.db("twitboost")

        // Update user plan
        const users = db.collection("users")
        await users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              plan,
              updatedAt: new Date(),
            },
          },
        )

        // Refresh credits
        await refreshUserCredits(db, new ObjectId(userId), plan)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Paystack webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
