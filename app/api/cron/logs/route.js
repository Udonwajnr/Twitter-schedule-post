import { NextResponse } from "next/server"
import { cronLogs } from "../post-scheduled/route"

export async function GET(req) {
  try {
    // Optional: verify authorization
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "test-secret"

    // if (authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const paginatedLogs = cronLogs.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      total: cronLogs.length,
      limit,
      offset,
      logs: paginatedLogs,
    })
  } catch (error) {
    console.error("[v0] Error fetching cron logs:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch logs",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
