import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl, taskId } = await request.json()

    console.log("[v0] Video generation request received:", {
      prompt: prompt?.substring(0, 50) + "...",
      imageUrl: imageUrl?.substring(0, 50) + "...",
      taskId,
    })

    if (!prompt || !imageUrl) {
      console.log("[v0] Missing required fields:", { prompt: !!prompt, imageUrl: !!imageUrl })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const kieApiKey = process.env.KIE_API_KEY
    if (!kieApiKey || kieApiKey === "your_kie_api_key_here") {
      console.error("[v0] KIE_API_KEY not configured properly in environment variables")
      return NextResponse.json({ 
        error: "KIE API key not configured. Please add your KIE API key to .env.local file. Get it from https://kie.ai/api-key" 
      }, { status: 500 })
    }

    const apiUrl = "https://api.kie.ai/api/v1/veo/generate"

    const requestBody = {
      prompt: prompt,
      imageUrls: [imageUrl],
      model: "veo3_fast",
      aspectRatio: "9:16",
      enableFallback: false,  // Disabled to avoid extra costs
    }

    console.log("[v0] Making KIE API request for video generation")
    console.log("[v0] Request parameters:", {
      model: "veo3_fast",
      aspectRatio: "9:16",
      prompt: prompt.substring(0, 100) + "...",
    })

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${kieApiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    const result = await response.json()
    
    console.log("[v0] KIE API response:", {
      ok: response.ok,
      status: response.status,
      code: result.code,
      msg: result.msg,
      hasData: !!result.data,
      taskId: result.data?.taskId,
      fullResponse: JSON.stringify(result).substring(0, 200)
    })

    if (!response.ok || result.code !== 200) {
      console.error("[v0] KIE API error:", result)
      return NextResponse.json(
        { 
          error: result.msg || "Failed to generate video",
          code: result.code,
          details: result,
        },
        { status: response.status }
      )
    }

    if (!result.data?.taskId) {
      console.error("[v0] No taskId in response:", result)
      return NextResponse.json(
        { error: "No taskId returned from API" },
        { status: 500 }
      )
    }

    console.log("[v0] Video generation task created:", {
      taskId: result.data.taskId,
      status: "processing",
    })

    return NextResponse.json({
      taskId: result.data?.taskId,
      status: "processing",
      message: "Video generation started",
    })
  } catch (error) {
    console.error("[v0] Error generating video:", error)
    return NextResponse.json(
      { error: `Failed to generate video: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}