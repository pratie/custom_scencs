"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, MoreVertical, RotateCcw } from "lucide-react"
import type { PictureMeVariation } from "@/lib/indexeddb"

interface VariationCardProps {
  variation: PictureMeVariation
  index: number
  onDownload: (imageUrl: string, name: string) => void
  onRegenerate?: (variationId: string) => void
}

function VariationCard({ variation, index, onDownload, onRegenerate }: VariationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (variation.status === 'pending') {
    return (
      <Card className="relative overflow-hidden">
        <div className="aspect-square bg-muted animate-pulse relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="p-4">
          <div className="h-4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        </div>
      </Card>
    )
  }

  if (variation.status === 'failed') {
    return (
      <Card className="relative overflow-hidden border-destructive/50">
        <div className="aspect-square bg-destructive/10 border-2 border-dashed border-destructive/50 flex flex-col items-center justify-center p-4">
          <p className="text-destructive font-medium mb-4 text-center">Generation failed</p>
          {onRegenerate && (
            <Button onClick={() => onRegenerate(variation.id)} size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium text-foreground">{variation.name}</h4>
          <p className="text-sm text-muted-foreground">
            {variation.error || 'Unknown error'}
          </p>
        </div>
      </Card>
    )
  }

  if (variation.status === 'success' && variation.imageUrl) {
    return (
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="aspect-square relative">
          <img
            src={variation.imageUrl}
            alt={variation.name}
            className="w-full h-full object-cover"
          />

          {/* Options menu */}
          <div className="absolute top-3 right-3 z-10" ref={menuRef}>
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    onDownload(variation.imageUrl!, variation.name)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {onRegenerate && (
                  <button
                    onClick={() => {
                      onRegenerate(variation.id)
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Regenerate
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick download button */}
          <div className="absolute bottom-3 right-3">
            <Button
              onClick={() => onDownload(variation.imageUrl!, variation.name)}
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h4 className="font-medium text-foreground">{variation.name}</h4>
          <p className="text-sm text-muted-foreground">
            {variation.generatedAt && `Generated ${new Date(variation.generatedAt).toLocaleTimeString()}`}
          </p>
        </div>
      </Card>
    )
  }

  return null
}

interface GenerationGridProps {
  variations: PictureMeVariation[]
  templateName?: string
  isGenerating?: boolean
  onDownload: (imageUrl: string, filename: string) => void
  onRegenerate?: (variationId: string) => void
}

export default function GenerationGrid({
  variations,
  templateName,
  isGenerating = false,
  onDownload,
  onRegenerate
}: GenerationGridProps) {
  const successfulVariations = variations.filter(v => v.status === 'success').length
  const totalVariations = variations.length

  const handleDownload = (imageUrl: string, variationName: string) => {
    const filename = `picture-me-${variationName.toLowerCase().replace(/\s+/g, '-')}.png`
    onDownload(imageUrl, filename)
  }

  if (variations.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Your Generated Photos</h2>
          {templateName && (
            <p className="text-muted-foreground mt-2">
              {templateName} • {successfulVariations}/{totalVariations} completed
            </p>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-muted rounded-full h-3 overflow-hidden shadow-sm">
            <div
              className="bg-secondary h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${totalVariations > 0 ? (successfulVariations / totalVariations) * 100 : 0}%`
              }}
            />
          </div>
          <p className="text-muted-foreground mt-4 text-sm text-center">
            Generating your variations... Please keep this window open.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {variations.map((variation, index) => (
          <VariationCard
            key={variation.id}
            variation={variation}
            index={index}
            onDownload={handleDownload}
            onRegenerate={onRegenerate}
          />
        ))}
      </div>

      {!isGenerating && successfulVariations > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Generated with Gemini AI • Click images to download
          </p>
        </div>
      )}
    </div>
  )
}