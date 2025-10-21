import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { getUserInvoices } from "@/lib/models/Invoice"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    const invoices = await getUserInvoices(db, session.user.id, 20)

    return NextResponse.json({ success: true, invoices })
  } catch (error) {
    console.error("❌ Get invoices error:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}
