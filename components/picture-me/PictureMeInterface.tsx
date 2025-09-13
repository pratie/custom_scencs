"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, RefreshCcw } from "lucide-react"
import TemplateSelector from "./TemplateSelector"
import PhotoUploader from "./PhotoUploader"
import GenerationGrid from "./GenerationGrid"
import { usePictureMeGeneration, useSavePictureMeSession } from "@/lib/queries"
import { useUsageLimits } from "@/lib/usage-limits"
import type { PictureMeSession, PictureMeVariation } from "@/lib/indexeddb"

export default function PictureMeInterface() {
  const { data: session } = useSession()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<PictureMeSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const generateMutation = usePictureMeGeneration()
  const saveMutation = useSavePictureMeSession()
  const usageLimits = useUsageLimits()

  const isGenerating = generateMutation.isPending

  // Check usage limits
  const canGenerateSession = usageLimits.canUsePictureMeSessions()
  const canGenerateImages = usageLimits.canUsePictureMeImages()
  const remainingSessions = usageLimits.getRemainingPictureMeSessions()
  const remainingImages = usageLimits.getRemainingPictureMeImages()

  const handleImageUpload = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl)
    setCurrentSession(null) // Reset current session when new image is uploaded
    setError(null)
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCurrentSession(null) // Reset current session when template changes
    setError(null)
  }

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedTemplate || !session?.user?.email) {
      setError("Please upload a photo and select a template")
      return
    }

    if (!canGenerateSession) {
      setError(`Daily limit reached. You have ${remainingSessions} sessions remaining today.`)
      return
    }

    if (!canGenerateImages) {
      setError(`Daily limit reached. You have ${remainingImages} images remaining today.`)
      return
    }

    setError(null)

    try {
      // Create initial session with pending variations
      const sessionId = `session-${Date.now()}`
      const initialSession: PictureMeSession = {
        id: sessionId,
        userId: session.user.email,
        title: `Picture Me - ${selectedTemplate}`,
        sourceImageUrl: uploadedImage,
        selectedTemplate,
        templateName: selectedTemplate,
        variations: [
          { id: 'var1', name: 'Variation 1', imageUrl: null, prompt: '', status: 'pending' },
          { id: 'var2', name: 'Variation 2', imageUrl: null, prompt: '', status: 'pending' },
          { id: 'var3', name: 'Variation 3', imageUrl: null, prompt: '', status: 'pending' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setCurrentSession(initialSession)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

      // Generate variations
      const result = await generateMutation.mutateAsync({
        imageUrl: uploadedImage,
        template: selectedTemplate,
        userId: session.user.email
      })

      if (result.success) {
        // Update session with generated variations
        const updatedVariations: PictureMeVariation[] = result.variations.map((variation: any, index: number) => ({
          id: `var${index + 1}`,
          name: `${variation.id}`.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          imageUrl: variation.imageUrl,
          prompt: variation.prompt,
          status: variation.status,
          error: variation.error,
          generatedAt: Date.now()
        }))

        const finalSession: PictureMeSession = {
          ...initialSession,
          templateName: result.templateName,
          variations: updatedVariations,
          updatedAt: Date.now()
        }

        setCurrentSession(finalSession)

        // Save to IndexedDB
        await saveMutation.mutateAsync(finalSession)

        // Record usage
        usageLimits.recordPictureMeSessionUse()
        const successfulCount = updatedVariations.filter(v => v.status === 'success').length
        for (let i = 0; i < successfulCount; i++) {
          usageLimits.recordPictureMeImageUse()
        }

      } else {
        setError("Generation failed. Please try again.")
      }

    } catch (error) {
      console.error("Generation failed:", error)
      setError(error instanceof Error ? error.message : "Generation failed. Please try again.")
    }
  }

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download failed:", error)
      setError("Download failed. Please try again.")
    }
  }

  const handleStartOver = () => {
    setUploadedImage(null)
    setSelectedTemplate(null)
    setCurrentSession(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isReadyToGenerate = uploadedImage && selectedTemplate && !isGenerating
  const hasResults = currentSession && currentSession.variations.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Picture<span className="text-secondary">Me</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your photos with AI. Each theme generates 3 unique variations.
          </p>

          {/* Usage stats */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>Sessions: {remainingSessions}/{usageLimits.DAILY_LIMITS.pictureMeSessions} remaining</span>
            <span>Images: {remainingImages}/{usageLimits.DAILY_LIMITS.pictureMeImages} remaining</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <Card className="p-4 border-destructive/50 bg-destructive/5">
            <div className="text-center text-destructive">
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Main interface */}
        <Card className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Photo Upload */}
            <PhotoUploader
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              disabled={isGenerating}
            />

            {/* Template Selection */}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              disabled={isGenerating}
            />

          </div>

          {/* Generate Button */}
          <div className="text-center pt-8">
            <Button
              onClick={handleGenerate}
              disabled={!isReadyToGenerate || !canGenerateSession || !canGenerateImages}
              size="lg"
              className="px-12 py-4 text-lg"
            >
              <div className="flex items-center gap-3">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 3 Photos
                  </>
                )}
              </div>
            </Button>

            {!canGenerateSession && (
              <p className="text-sm text-destructive mt-2">
                Daily session limit reached. Try again tomorrow.
              </p>
            )}

            {!canGenerateImages && canGenerateSession && (
              <p className="text-sm text-destructive mt-2">
                Daily image limit reached. Try again tomorrow.
              </p>
            )}
          </div>
        </Card>

        {/* Results */}
        <div ref={resultsRef}>
          {hasResults && (
            <div className="space-y-8">
              <GenerationGrid
                variations={currentSession.variations}
                templateName={currentSession.templateName}
                isGenerating={isGenerating}
                onDownload={handleDownload}
              />

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button onClick={handleStartOver} variant="outline">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}