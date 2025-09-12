import { TextElement } from "./indexeddb"

export interface TextPreset {
  id: string
  name: string
  description: string
  icon: string
  style: Partial<Omit<TextElement, 'id'>>
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: "pov-bold",
    name: "POV Bold",
    description: "Classic POV style with bold impact",
    icon: "💥",
    style: {
      content: "POV:",
      fontFamily: "Montserrat",
      fontSize: 180,
      fontWeight: 800,
      color: "#FFFFFF",
      opacity: 100,
      hasShadow: true,
      isForeground: false,
      positionX: 20,
      positionY: 25
    }
  },
  {
    id: "pov-massive",
    name: "POV Massive",
    description: "Giant text for maximum impact",
    icon: "🔥",
    style: {
      content: "POV:",
      fontFamily: "Anton",
      fontSize: 240,
      fontWeight: 400,
      color: "#FFEB3B",
      opacity: 100,
      hasShadow: true,
      isForeground: false,
      positionX: 50,
      positionY: 20
    }
  },
  {
    id: "you-found",
    name: "You Found",
    description: "Perfect for discovery content",
    icon: "✨",
    style: {
      content: "You found the perfect...",
      fontFamily: "Bebas Neue",
      fontSize: 120,
      fontWeight: 400,
      color: "#FF5722",
      opacity: 100,
      hasShadow: true,
      isForeground: false,
      positionX: 50,
      positionY: 70
    }
  },
  {
    id: "youtube-title",
    name: "YouTube Title",
    description: "Thumbnail-ready title style",
    icon: "📺",
    style: {
      content: "THIS CHANGED EVERYTHING",
      fontFamily: "Righteous",
      fontSize: 100,
      fontWeight: 400,
      color: "#FFFFFF",
      opacity: 100,
      hasShadow: true,
      isForeground: true,
      positionX: 50,
      positionY: 15
    }
  },
  {
    id: "clean-overlay",
    name: "Clean Overlay",
    description: "Minimal and professional",
    icon: "🎯",
    style: {
      content: "Simple. Clean. Perfect.",
      fontFamily: "Inter",
      fontSize: 80,
      fontWeight: 600,
      color: "#000000",
      opacity: 90,
      hasShadow: false,
      isForeground: true,
      positionX: 50,
      positionY: 50
    }
  },
  {
    id: "creative-fun",
    name: "Creative Fun",
    description: "Playful and engaging",
    icon: "🎨",
    style: {
      content: "Something amazing!",
      fontFamily: "Fredoka One",
      fontSize: 140,
      fontWeight: 400,
      color: "#E91E63",
      opacity: 100,
      hasShadow: true,
      isForeground: false,
      positionX: 50,
      positionY: 40
    }
  }
]

export const getPresetById = (id: string): TextPreset | undefined => {
  return TEXT_PRESETS.find(preset => preset.id === id)
}

export const applyPresetToTextElement = (
  textElement: TextElement, 
  preset: TextPreset
): TextElement => {
  return {
    ...textElement,
    ...preset.style
  }
}