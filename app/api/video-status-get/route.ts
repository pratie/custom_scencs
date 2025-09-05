import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    console.log("[v0] Checking video status (GET) for task:", taskId)

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 })
    }

    const kieApiKey = process.env.KIE_API_KEY
    if (!kieApiKey) {
      console.error("[v0] KIE_API_KEY not configured in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Try with GET request and taskId in URL
    const apiUrl = `https://api.kie.ai/api/v1/veo/task/${taskId}`

    console.log("[v0] Checking status at (GET):", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${kieApiKey}`,
      },
    })

    const responseText = await response.text()
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Failed to parse response:", responseText)
      result = { error: "Invalid response from API" }
    }

    console.log("[v0] Video status response (GET):", {
      status: response.status,
      ok: response.ok,
      result: JSON.stringify(result).substring(0, 500)
    })

    if (!response.ok) {
      // If GET doesn't work, fallback to the working URL from your logs
      const fallbackUrl = `https://api.kie.ai/api/v1/task/result/${taskId}`
      console.log("[v0] Trying fallback URL:", fallbackUrl)
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
        },
      })

      const fallbackText = await fallbackResponse.text()
      let fallbackResult
      try {
        fallbackResult = JSON.parse(fallbackText)
      } catch (e) {
        console.error("[v0] Failed to parse fallback response:", fallbackText)
        return NextResponse.json({ error: "Failed to check video status" }, { status: 500 })
      }

      console.log("[v0] Fallback response:", {
        status: fallbackResponse.status,
        result: JSON.stringify(fallbackResult).substring(0, 500)
      })

      if (fallbackResponse.ok && fallbackResult.data?.result_urls) {
        return NextResponse.json({
          status: "completed",
          videoUrl: fallbackResult.data.result_urls[0],
          originUrl: fallbackResult.data.origin_urls?.[0],
          resolution: fallbackResult.data.resolution || "1080p",
          taskId,
        })
      }
    }

    // Process the response if successful
    if (result.code === 200 && result.data?.info?.resultUrls) {
      return NextResponse.json({
        status: "completed",
        videoUrl: result.data.info.resultUrls[0],
        originUrl: result.data.info.originUrls?.[0],
        resolution: result.data.info.resolution,
        taskId,
      })
    } else if (result.code === 501 || result.code === 422) {
      return NextResponse.json({
        status: "failed",
        error: result.msg,
        taskId,
      })
    } else {
      return NextResponse.json({
        status: "processing",
        message: result.msg || "Video is still being generated",
        taskId,
      })
    }
  } catch (error) {
    console.error("[v0] Error checking video status:", error)
    return NextResponse.json(
      { error: `Failed to check video status: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}