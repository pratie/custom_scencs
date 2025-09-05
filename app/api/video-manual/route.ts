import { type NextRequest, NextResponse } from "next/server"

// Track video generation times and simulate completion after ~3-5 minutes
const videoStartTimes = new Map<string, number>()

// Manual endpoint that simulates video processing time
export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    console.log("[v0] Manual video status check for task:", taskId)

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 })
    }

    // Track when we first saw this taskId
    if (!videoStartTimes.has(taskId)) {
      videoStartTimes.set(taskId, Date.now())
      console.log("[v0] Started tracking video generation for:", taskId)
    }

    const startTime = videoStartTimes.get(taskId)!
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60

    console.log(`[v0] Video ${taskId} has been processing for ${elapsedMinutes.toFixed(1)} minutes`)

    // Simulate video completion after 3-5 minutes (varies by taskId hash)
    const completionTime = 3 + (parseInt(taskId.substring(0, 2), 16) % 3) // 3-5 minutes based on taskId
    
    if (elapsedMinutes >= completionTime) {
      // Video is ready - generate a placeholder URL
      console.log(`[v0] Video ${taskId} completed after ${elapsedMinutes.toFixed(1)} minutes!`)
      
      // Clean up tracking
      videoStartTimes.delete(taskId)
      
      return NextResponse.json({
        status: "completed",
        videoUrl: `https://tempfile.aiquickdraw.com/simulated/${taskId}.mp4`,
        originUrl: null,
        resolution: "1080p",
        taskId,
        message: `Video completed after ${elapsedMinutes.toFixed(1)} minutes (simulated)`
      })
    }

    // Still processing
    const progress = Math.min(95, Math.floor((elapsedMinutes / completionTime) * 100))
    
    return NextResponse.json({
      status: "processing",
      message: `Video generation in progress... (${progress}% - ~${(completionTime - elapsedMinutes).toFixed(1)} minutes remaining)`,
      taskId,
      progress,
      elapsedMinutes: elapsedMinutes.toFixed(1),
      estimatedMinutesRemaining: (completionTime - elapsedMinutes).toFixed(1)
    })
  } catch (error) {
    console.error("[v0] Error in manual video status:", error)
    return NextResponse.json(
      { error: `Failed to check video status: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}