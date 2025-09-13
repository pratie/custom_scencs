import { type NextRequest, NextResponse } from "next/server"

// Template definitions for Picture Me
const TEMPLATES = {
  headshots: {
    name: 'Professional Headshots',
    variations: [
      { id: 'business-suit', prompt: 'professional headshot wearing a dark business suit with a crisp white shirt, facing forward with a friendly smile, against a clean neutral studio background' },
      { id: 'smart-casual', prompt: 'professional headshot wearing a smart-casual knit sweater over a collared shirt, with a confident look, against a clean neutral studio background' },
      { id: 'creative-pro', prompt: 'professional headshot wearing a dark turtleneck, with a thoughtful gaze, against a clean neutral studio background' }
    ]
  },
  decades: {
    name: 'Time Traveler',
    variations: [
      { id: '1980s', prompt: '1980s style portrait with authentic 80s hair, clothing, and accessories' },
      { id: '1990s', prompt: '1990s style portrait with authentic 90s hair, clothing, and accessories' },
      { id: '2000s', prompt: '2000s style portrait with authentic 2000s hair, clothing, and accessories' }
    ]
  },
  hairStyler: {
    name: 'Hair Styler',
    variations: [
      { id: 'short-modern', prompt: 'modern short hairstyle, maintaining the original background and clothing' },
      { id: 'medium-wavy', prompt: 'medium-length wavy hairstyle, maintaining the original background and clothing' },
      { id: 'long-straight', prompt: 'long straight hairstyle, maintaining the original background and clothing' }
    ]
  }
}

interface GenerationRequest {
  imageUrl: string
  template: keyof typeof TEMPLATES
  userId: string
}

const fetchWithRetry = (url: string, options: RequestInit, retries = 5, backoff = 1000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number, delay: number) => {
      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          if (response.status === 429 && retryCount > 0) {
            console.log(`Rate limited. Retrying in ${delay / 1000}s...`)
            setTimeout(() => attempt(retryCount - 1, delay * 2), delay)
          } else if (response.status === 401) {
            reject(new Error(`API request failed with status 401: Unauthorized. Please ensure your API key is valid.`))
          } else {
            reject(new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`))
          }
        } else {
          resolve(response.json())
        }
      } catch (error) {
        if (retryCount > 0) {
          console.log(`Request failed. Retrying in ${delay / 1000}s...`, error)
          setTimeout(() => attempt(retryCount - 1, delay * 2), delay)
        } else {
          reject(error)
        }
      }
    }
    attempt(retries, backoff)
  })
}

async function generateImageWithRetry(payload: any, totalAttempts = 3): Promise<string> {
  let lastError: Error = new Error('Unknown error')
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured")
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`

      const result = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      // Debug: Log the full API response
      console.log(`[Picture Me] Full Gemini API response:`, JSON.stringify(result, null, 2))

      const base64Data = result?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data

      if (base64Data) {
        return `data:image/png;base64,${base64Data}`
      }

      // Debug: Log what we found instead
      console.log(`[Picture Me] No image data found. Response structure:`, {
        hasCandidates: !!result?.candidates,
        candidatesLength: result?.candidates?.length,
        firstCandidate: result?.candidates?.[0],
        candidateContent: result?.candidates?.[0]?.content,
        candidateParts: result?.candidates?.[0]?.content?.parts?.map((p: any) => Object.keys(p))
      })

      lastError = new Error("API returned no image data.")
      console.warn(`Attempt ${attempt}/${totalAttempts}: ${lastError.message}`)

    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt}/${totalAttempts} failed:`, error)
    }

    if (attempt < totalAttempts) {
      const delay = 2500 * Math.pow(2, attempt - 1)
      console.log(`Waiting ${delay / 1000}s before next attempt...`)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  throw new Error(`Image generation failed after ${totalAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`)
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, template, userId }: GenerationRequest = await request.json()

    console.log("[Picture Me] Generation request received:", {
      template,
      userId,
      imageUrl: imageUrl?.substring(0, 50) + "...",
    })

    // Validation
    if (!imageUrl || !template || !userId) {
      return NextResponse.json({
        error: "Missing required fields: imageUrl, template, userId"
      }, { status: 400 })
    }

    if (!TEMPLATES[template]) {
      return NextResponse.json({
        error: `Invalid template: ${template}. Available: ${Object.keys(TEMPLATES).join(', ')}`
      }, { status: 400 })
    }

    // Extract base64 data from imageUrl
    const base64Match = imageUrl.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/)
    if (!base64Match) {
      return NextResponse.json({
        error: "Invalid image format. Expected base64 data URL"
      }, { status: 400 })
    }

    const imageBase64 = base64Match[1]
    const templateConfig = TEMPLATES[template]

    console.log(`[Picture Me] Generating 3 variations for template: ${template}`)

    // Generate 3 variations concurrently with some delay to avoid rate limiting
    const variations = []

    for (let i = 0; i < templateConfig.variations.length; i++) {
      const variation = templateConfig.variations[i]

      try {
        console.log(`[Picture Me] Generating variation ${i + 1}: ${variation.id}`)

        // Add small delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        const modelInstruction = `The highest priority is to maintain the exact facial features, likeness, and perceived gender of the person in the provided reference photo. Transform the photo to: ${variation.prompt}. Do not alter the person's core facial structure.`

        const payload = {
          contents: [{
            parts: [
              { text: modelInstruction },
              { inlineData: { mimeType: "image/png", data: imageBase64 } }
            ]
          }]
        }

        const generatedImageUrl = await generateImageWithRetry(payload)

        variations.push({
          id: variation.id,
          imageUrl: generatedImageUrl,
          prompt: variation.prompt,
          status: 'success'
        })

        console.log(`[Picture Me] Successfully generated variation: ${variation.id}`)

      } catch (error) {
        console.error(`[Picture Me] Failed to generate variation ${variation.id}:`, error)

        variations.push({
          id: variation.id,
          imageUrl: null,
          prompt: variation.prompt,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = variations.filter(v => v.status === 'success').length
    console.log(`[Picture Me] Generation completed: ${successCount}/3 successful`)

    return NextResponse.json({
      success: true,
      template,
      templateName: templateConfig.name,
      variations,
      stats: {
        total: variations.length,
        successful: successCount,
        failed: variations.length - successCount
      }
    })

  } catch (error) {
    console.error("[Picture Me] Generation failed:", error)

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error",
      success: false
    }, { status: 500 })
  }
}