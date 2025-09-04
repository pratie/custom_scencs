import { type NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl } = await request.json()

    console.log("[v0] API Request received:", {
      prompt: prompt?.substring(0, 50) + "...",
      imageUrl: imageUrl?.substring(0, 50) + "...",
    })

    if (!prompt || !imageUrl) {
      console.log("[v0] Missing required fields:", { prompt: !!prompt, imageUrl: !!imageUrl })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get API key from environment variable
    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      console.error("[v0] FAL_API_KEY not configured in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    fal.config({
      credentials: falKey,
    })

    const endpoint = "fal-ai/nano-banana/edit"
    console.log("[v0] Using Nano Banana edit model endpoint:", endpoint)

    const input = {
      prompt: prompt,
      image_urls: [imageUrl],
    }

    console.log("[v0] Making FAL API request using fal-js client with Nano Banana")
    console.log("[v0] Input parameters:", {
      image_urls: [imageUrl.substring(0, 50) + "..."],
      prompt: prompt,
    })

    const result = await fal.subscribe(endpoint, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[v0] FAL processing:", update.logs?.map((log) => log.message).join(", "))
        }
      },
    })

    console.log("[v0] FAL API success, received result:", {
      hasImages: !!result.data.images,
      imageCount: result.data.images?.length || 0,
      requestId: result.requestId,
    })

    return NextResponse.json({
      imageUrl: result.data.images?.[0]?.url || "/placeholder.svg?height=512&width=512",
    })
  } catch (error) {
    console.error("[v0] Error generating image:", error)
    console.error("[v0] Error details:", error instanceof Error && 'status' in error ? {
      status: (error as any).status,
      body: (error as any).body,
      message: error.message
    } : error)
    return NextResponse.json({ 
      error: `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error && 'status' in error ? (error as any).body : null
    }, { status: 500 })
  }
}
