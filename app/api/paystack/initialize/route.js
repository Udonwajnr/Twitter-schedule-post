import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { clientPromise } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { plan, email } = await req.json()

    if (!plan || !email) {
      return NextResponse.json({ error: "Plan and email required" }, { status: 400 })
    }

    const planPrices = {
      basic: 500000, // 5000 NGN in kobo
      premium: 1000000, // 10000 NGN in kobo
    }

    const amount = planPrices[plan]
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    const { createInvoice } = await import("@/lib/models/Invoice")
    const invoice = await createInvoice(db, {
      userId: new ObjectId(session.user.id),
      plan,
      amount: amount / 100, // Convert from kobo to NGN
    })

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency: "NGN",
        metadata: {
          userId: session.user.id,
          plan,
          invoiceId: invoice._id.toString(), // Add invoice ID to metadata
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/callback`,
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }

    const { updateInvoiceStatus } = await import("@/lib/models/Invoice")
    await db
      .collection("invoices")
      .updateOne({ _id: invoice._id }, { $set: { paystackReference: data.data.reference } })

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("❌ Paystack initialize error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
