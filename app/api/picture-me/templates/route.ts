import { NextResponse } from "next/server"

const TEMPLATES = {
  headshots: {
    name: 'Professional Headshots',
    description: 'Professional profile pictures for business use',
    icon: '💼',
    variations: [
      { id: 'business-suit', name: 'Business Suit', description: 'Dark suit with white shirt' },
      { id: 'smart-casual', name: 'Smart Casual', description: 'Sweater over collared shirt' },
      { id: 'creative-pro', name: 'Creative Pro', description: 'Modern dark turtleneck' }
    ]
  },
  decades: {
    name: 'Time Traveler',
    description: 'See yourself through different decades',
    icon: '⏳',
    variations: [
      { id: '1980s', name: '1980s', description: 'Authentic 80s style portrait' },
      { id: '1990s', name: '1990s', description: 'Classic 90s fashion and hair' },
      { id: '2000s', name: '2000s', description: 'Early 2000s aesthetic' }
    ]
  },
  hairStyler: {
    name: 'Hair Styler',
    description: 'Try different hairstyles and lengths',
    icon: '💇‍♀️',
    variations: [
      { id: 'short-modern', name: 'Short & Modern', description: 'Contemporary short cut' },
      { id: 'medium-wavy', name: 'Medium Wavy', description: 'Shoulder-length waves' },
      { id: 'long-straight', name: 'Long & Straight', description: 'Sleek long hairstyle' }
    ]
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      templates: TEMPLATES,
      templateIds: Object.keys(TEMPLATES),
      success: true
    })
  } catch (error) {
    console.error("[Picture Me Templates] Error:", error)

    return NextResponse.json({
      error: "Failed to fetch templates",
      success: false
    }, { status: 500 })
  }
}