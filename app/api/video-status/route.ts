import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()

    console.log("[v0] Checking video status for task:", taskId)

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 })
    }

    const kieApiKey = process.env.KIE_API_KEY
    if (!kieApiKey) {
      console.error("[v0] KIE_API_KEY not configured in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Try different parameter formats since docs aren't clear
    let response;
    let apiUrl;
    
    // First try: Query parameter with 'taskId'
    apiUrl = `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`
    console.log("[v0] Trying query param 'taskId':", apiUrl)
    
    response = await fetch(apiUrl, {
      method: "GET", 
      headers: {
        "Authorization": `Bearer ${kieApiKey}`,
      },
    })
    
    // If that fails, try 'task_id' (underscore)
    if (!response.ok && response.status === 404) {
      apiUrl = `https://api.kie.ai/api/v1/veo/record-info?task_id=${taskId}`
      console.log("[v0] Trying query param 'task_id':", apiUrl)
      
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
        },
      })
    }
    
    // If that fails, try 'id'
    if (!response.ok && response.status === 404) {
      apiUrl = `https://api.kie.ai/api/v1/veo/record-info?id=${taskId}`
      console.log("[v0] Trying query param 'id':", apiUrl)
      
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
        },
      })
    }
    
    // If still failing, try as path parameter
    if (!response.ok && response.status === 404) {
      apiUrl = `https://api.kie.ai/api/v1/veo/record-info/${taskId}`
      console.log("[v0] Trying as path parameter:", apiUrl)
      
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${kieApiKey}`,
        },
      })
    }
    
    // Last attempt: Try POST with body (like generate endpoint)
    if (!response.ok && response.status === 404) {
      apiUrl = `https://api.kie.ai/api/v1/veo/record-info`
      console.log("[v0] Trying POST with body:", apiUrl)
      
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieApiKey}`,
        },
        body: JSON.stringify({ taskId }),
      })
    }
    
    // Also try alternative endpoints
    if (!response.ok && response.status === 404) {
      apiUrl = `https://api.kie.ai/api/v1/veo/details`
      console.log("[v0] Trying alternative endpoint /veo/details with POST:", apiUrl)
      
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kieApiKey}`,
        },
        body: JSON.stringify({ taskId }),
      })
    }

    const responseText = await response.text()
    console.log("[v0] Raw response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyPreview: responseText.substring(0, 500)
    })

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Failed to parse response:", responseText)
      // If it's HTML, it might be a 404 page
      if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
        console.error("[v0] Received HTML instead of JSON - endpoint might be wrong")
        return NextResponse.json(
          { error: "Wrong endpoint - received HTML instead of JSON" },
          { status: 404 }
        )
      }
      result = { error: "Invalid response from API" }
    }

    if (!response.ok) {
      console.error("[v0] KIE API status check failed. Status:", response.status)
      console.error("[v0] Error response:", result)
      
      // Maybe the endpoint needs different auth or structure
      return NextResponse.json(
        { 
          error: result.msg || result.message || "Failed to check video status",
          code: result.code || response.status,
          details: result
        },
        { status: response.status }
      )
    }

    console.log("[v0] Video status response:", {
      taskId,
      code: result.code,
      msg: result.msg,
      hasData: !!result.data,
      status: response.status,
      fullResponse: JSON.stringify(result).substring(0, 800)
    })

    // Handle case where API returns 200 but video is still processing
    if (result.code === 200 && result.msg === "success" && result.data) {
      const successFlag = result.data.successFlag
      const response = result.data.response
      
      console.log("[v0] Success flag:", successFlag, "Has response:", !!response)
      
      // Check successFlag status:
      // 0: Still generating
      // 1: Success
      // 2: Failed
      // 3: Generation failed
      
      if (successFlag === 1 && response) {
        // Parse the response field which contains the video URLs
        let videoData
        try {
          videoData = typeof response === 'string' ? JSON.parse(response) : response
        } catch (e) {
          videoData = response
        }
        
        const videoUrl = videoData?.resultUrls?.[0] || 
                        videoData?.result_urls?.[0] ||
                        videoData?.videoUrl ||
                        videoData?.url
        
        if (videoUrl) {
          console.log("[v0] Video completed! URL:", videoUrl)
          return NextResponse.json({
            status: "completed",
            videoUrl: videoUrl,
            originUrl: videoData?.originUrls?.[0] || null,
            resolution: videoData?.resolution || "1080p",
            taskId,
            completeTime: result.data.completeTime
          })
        }
      } else if (successFlag === 2 || successFlag === 3) {
        // Video generation failed
        console.log("[v0] Video generation failed with flag:", successFlag)
        return NextResponse.json({
          status: "failed",
          error: result.data.errorMessage || result.data.errorCode || "Video generation failed",
          taskId,
        })
      } else if (successFlag === 0 || successFlag === null) {
        // Still processing
        const createTime = result.data.createTime
        const elapsedMs = Date.now() - createTime
        const elapsedMinutes = Math.floor(elapsedMs / 60000)
        
        console.log("[v0] Video still processing. Elapsed:", elapsedMinutes, "minutes")
        return NextResponse.json({
          status: "processing",
          message: `Video is being generated... (~${elapsedMinutes} minutes elapsed)`,
          taskId,
          successFlag,
          createTime,
          elapsedMinutes
        })
      }
    } else if (result.code === 501 || result.code === 422 || result.code === 400) {
      console.log("[v0] Video generation failed:", result.msg)
      return NextResponse.json({
        status: "failed",
        error: result.msg || "Video generation failed",
        taskId,
      })
    } else {
      console.log("[v0] Video still processing (non-200 code)")
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