import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "test-secret"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Manual cron trigger initiated")

    // Call the cron job endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cron/post-scheduled`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Cron job triggered manually",
      result: data,
    })
  } catch (error) {
    console.error("[v0] Error triggering cron:", error)
    return NextResponse.json(
      {
        error: "Failed to trigger cron",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
