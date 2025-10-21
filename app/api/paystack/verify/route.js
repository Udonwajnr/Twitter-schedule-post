import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { refreshUserCredits } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { updateInvoiceStatus } from "@/lib/models/Invoice"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 })
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const { plan } = data.data.metadata

    // Update user plan and credits
    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    const users = db.collection("users")
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          plan,
          paystackCustomerId: data.data.customer.customer_code,
          updatedAt: new Date(),
        },
      },
    )

    await refreshUserCredits(db, new ObjectId(session.user.id), plan)

    await updateInvoiceStatus(db, reference, "paid", new Date())

    return NextResponse.json({
      success: true,
      plan,
      message: "Payment successful! Your plan has been upgraded.",
    })
  } catch (error) {
    console.error("❌ Paystack verify error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
