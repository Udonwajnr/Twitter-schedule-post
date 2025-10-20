import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getUserByEmail, updateUserCredits } from "@/lib/models/User"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    const user = await getUserByEmail(db, session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password before sending
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, bio, emailNotifications, autoPost } = body

    const mongoClient = await clientPromise
    const db = mongoClient.db("twitboost")

    const user = await getUserByEmail(db, session.user.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedData = {
      ...user,
      name,
      bio,
      emailNotifications,
      autoPost,
      updatedAt: new Date(),
    }

    // Update user in DB
    const usersCollection = db.collection("users")
    await usersCollection.updateOne({ email: session.user.email }, { $set: updatedData })

    // Remove password before returning
    const { password, ...userWithoutPassword } = updatedData

    return NextResponse.json({ user: userWithoutPassword, message: "Profile updated successfully" })
  } catch (error) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
