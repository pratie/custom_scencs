import { type NextRequest, NextResponse } from "next/server"
import { fal } from "@fal-ai/client"

export async function POST(request: NextRequest) {
  try {
    const { text, imageUrl, voice, prompt, resolution } = await request.json()

    console.log("[v0] Avatar video generation request received:", {
      text: text?.substring(0, 50) + "...",
      imageUrl: imageUrl?.substring(0, 50) + "...",
      voice,
      prompt: prompt?.substring(0, 50) + "...",
      resolution
    })

    if (!text || !imageUrl || !voice) {
      console.log("[v0] Missing required fields:", { text: !!text, imageUrl: !!imageUrl, voice: !!voice })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get FAL API key from environment variable
    const falKey = process.env.FAL_API_KEY
    if (!falKey) {
      console.error("[v0] FAL_API_KEY not configured in environment variables")
      return NextResponse.json({ error: "FAL API key not configured" }, { status: 500 })
    }

    console.log("[v0] FAL API key configured:", falKey ? `${falKey.substring(0, 8)}...` : "NOT SET")

    fal.config({
      credentials: falKey,
    })

    const endpoint = "fal-ai/infinitalk/single-text"
    console.log("[v0] Using InfiniTalk avatar generation endpoint:", endpoint)

    // Calculate frames based on text length with buffer for natural speech
    // Conservative: 2.5 words per second + 20% buffer for pauses/punctuation
    const cleanText = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
    const estimatedWords = cleanText.split(' ').length
    const baseSeconds = Math.ceil(estimatedWords / 2.5) // Slower, more natural pace
    const bufferSeconds = Math.ceil(baseSeconds * 0.2) // 20% buffer
    const totalSeconds = Math.max(6, baseSeconds + bufferSeconds)
    const calculatedFrames = Math.min(721, totalSeconds * 30) // 30 fps
    
    const input = {
      image_url: imageUrl,
      text_input: text,
      voice: voice,
      prompt: prompt || "", // FAL requires this field, use empty string if not provided
      num_frames: calculatedFrames, // Dynamic based on text length
      resolution: resolution || "480p",
      seed: 42,
      acceleration: "regular"
    }

    console.log("[v0] Making FAL API request for avatar generation")
    console.log("[v0] Duration calculation:", {
      word_count: estimatedWords,
      base_seconds: baseSeconds,
      buffer_seconds: bufferSeconds,
      total_seconds: totalSeconds,
      final_frames: calculatedFrames
    })
    
    console.log("[v0] Input parameters:", {
      image_url: imageUrl.substring(0, 50) + "...",
      text_input: text.substring(0, 100) + "...",
      voice: voice,
      prompt: prompt ? prompt.substring(0, 50) + "..." : "(empty - using blank prompt)",
      resolution: resolution || "480p",
      num_frames: calculatedFrames,
      estimated_duration: `~${Math.ceil(calculatedFrames / 30)}s`
    })

    try {
      console.log("[v0] Starting FAL API subscription...")
      
      const result = await Promise.race([
        fal.subscribe(endpoint, {
          input,
          logs: true,
          onQueueUpdate: (update) => {
            console.log("[v0] FAL avatar queue update:", {
              status: update.status,
              position: update.queue_position,
              logs: update.logs?.map((log) => log.message).join(", ") || "No logs"
            })
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("FAL API timeout after 5 minutes")), 5 * 60 * 1000)
        )
      ])

      console.log("[v0] FAL avatar API success, received result:", {
        hasVideo: !!result.data.video,
        videoUrl: result.data.video?.url,
        fileSize: result.data.video?.file_size,
        requestId: result.requestId,
      })

      if (!result.data.video?.url) {
        console.error("[v0] No video URL in avatar response:", result.data)
        return NextResponse.json({ error: "No video generated" }, { status: 500 })
      }

      return NextResponse.json({
        videoUrl: result.data.video.url,
        fileSize: result.data.video.file_size,
        fileName: result.data.video.file_name,
        seed: result.data.seed,
        status: "completed"
      })
    } catch (falError: any) {
      console.error("[v0] FAL Avatar API Error:", {
        message: falError.message,
        status: falError.status,
        hasBody: !!falError.body,
        errorType: typeof falError,
        fullError: falError
      })
      
      if (falError.body?.detail) {
        console.error("[v0] Validation error details:", JSON.stringify(falError.body.detail, null, 2))
      }
      
      // Check if it's a timeout error
      if (falError.message?.includes("timeout")) {
        return NextResponse.json({ 
          error: "Avatar generation is taking longer than expected. Please try again.",
          details: "Request timeout after 5 minutes"
        }, { status: 504 })
      }
      
      return NextResponse.json({ 
        error: "Avatar video generation failed. Please try with a different image or text.",
        details: falError.body?.detail?.[0]?.msg || falError.message || "Unknown error"
      }, { status: falError.status || 500 })
    }
  } catch (error) {
    console.error("[v0] Error generating avatar video:", error)
    return NextResponse.json({ 
      error: `Failed to generate avatar video: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}