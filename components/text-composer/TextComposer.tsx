"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { TextElement } from "@/lib/indexeddb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { 
  PlusCircle, 
  Trash2, 
  Copy, 
  Download,
  Type,
  Loader2
} from "lucide-react"

interface TextComposerProps {
  imageSrc: string | null
  onTextCompositionChange?: (hasText: boolean, textElements: TextElement[]) => void
  onImageGenerated?: (imageUrl: string, textElements: TextElement[]) => void
}

const initialTextElement: Omit<TextElement, "id"> = {
  content: "POV",
  fontFamily: "Roboto",
  fontSize: 200,
  fontWeight: 700,
  color: "rgba(255, 255, 255, 1)",
  opacity: 100,
  rotation: 0,
  positionX: 50,
  positionY: 50,
  letterSpacing: 0,
  hasShadow: true,
  isForeground: false,
}

const TextComposer: React.FC<TextComposerProps> = ({
  imageSrc,
  onTextCompositionChange,
  onImageGenerated
}) => {
  const [loading, setLoading] = useState(false)
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [imageBrightness, setImageBrightness] = useState(100)
  const [imageContrast, setImageContrast] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize with image when provided
  useEffect(() => {
    if (imageSrc && textElements.length === 0) {
      addNewText()
      setCanvasReady(true)
      processBackgroundRemoval()
    }
  }, [imageSrc])

  // Notify parent of text composition changes
  useEffect(() => {
    onTextCompositionChange?.(textElements.length > 0, textElements)
  }, [textElements, onTextCompositionChange])

  const processBackgroundRemoval = async () => {
    if (!imageSrc) return
    
    setLoading(true)
    try {
      // For now, we'll use a placeholder - you'll implement @imgly/background-removal later
      console.log("[TextComposer] Background removal would happen here")
      setProcessedImageSrc(null) // Will be set when background removal is implemented
    } catch (error) {
      console.error("Error removing background:", error)
      setProcessedImageSrc(null)
    }
    setLoading(false)
  }

  const addNewText = () => {
    setTextElements((prev) => [
      ...prev,
      { ...initialTextElement, id: Date.now().toString() + Math.random().toString(36).substring(2, 15) },
    ])
  }

  const updateTextElement = (id: string, newProps: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newProps } : el))
    )
  }

  const deleteTextElement = (id: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id))
  }

  const duplicateTextElement = (id: string) => {
    const originalElement = textElements.find(el => el.id === id)
    if (originalElement) {
      const newElement = {
        ...originalElement,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
        positionX: Math.min(100, originalElement.positionX + 5),
        positionY: Math.min(100, originalElement.positionY + 5),
      }
      setTextElements(prev => [...prev, newElement])
    }
  }

  const drawCompositeImage = useCallback(() => {
    if (!canvasRef.current || !canvasReady || !imageSrc) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 600
      const aspectRatio = img.width / img.height

      let canvasWidth = img.width
      let canvasHeight = img.height

      if (canvasWidth > maxWidth) {
        canvasWidth = maxWidth
        canvasHeight = canvasWidth / aspectRatio
      }
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight
        canvasWidth = canvasHeight * aspectRatio
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Draw background image
      ctx.filter = `brightness(${imageBrightness}%) contrast(${imageContrast}%)`
      ctx.globalAlpha = backgroundOpacity / 100
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'
      ctx.globalAlpha = 1

      // Separate text elements into foreground and background layers
      const foregroundTextElements = textElements.filter(el => el.isForeground)
      const backgroundTextElements = textElements.filter(el => !el.isForeground)

      // Function to draw text elements
      const drawTextElements = (elementsToDraw: TextElement[]) => {
        elementsToDraw.forEach((textEl) => {
          ctx.save()
          const x = canvas.width * (textEl.positionX / 100)
          const y = canvas.height * (textEl.positionY / 100)

          ctx.translate(x, y)
          ctx.rotate((textEl.rotation * Math.PI) / 180)

          ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px "${textEl.fontFamily}"`

          // Apply shadow if enabled
          if (textEl.hasShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 1)'
            ctx.shadowBlur = 8
            ctx.shadowOffsetX = 5
            ctx.shadowOffsetY = 5
          } else {
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          }

          ctx.fillStyle = textEl.color
          ctx.globalAlpha = textEl.opacity / 100
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          ctx.fillText(textEl.content, 0, 0)
          ctx.restore()
        })
      }

      // 2. Draw text elements that are *behind* the processed image
      drawTextElements(backgroundTextElements)

      // 3. Draw processed image (foreground subject without background)
      // TODO: Implement when background removal is added
      // if (processedImg) {
      //   ctx.globalAlpha = 1
      //   ctx.drawImage(processedImg, 0, 0, canvas.width, canvas.height)
      // }

      // 4. Draw text elements that are *above* the processed image
      drawTextElements(foregroundTextElements)
    }

    img.src = imageSrc
  }, [
    canvasReady, imageSrc, processedImageSrc, textElements,
    backgroundOpacity, imageBrightness, imageContrast
  ])

  useEffect(() => {
    if (canvasReady && imageSrc) {
      drawCompositeImage()
    }
  }, [canvasReady, imageSrc, drawCompositeImage])

  const handleDownload = async () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "text-composition.png"
      link.href = canvasRef.current.toDataURL("image/png")
      link.click()

      // Generate final image URL and notify parent
      const finalImageUrl = canvasRef.current.toDataURL("image/png")
      onImageGenerated?.(finalImageUrl, textElements)
    }
  }

  if (!imageSrc) {
    return (
      <Card className="bg-card border-border brutal-border">
        <CardContent className="p-8 text-center">
          <Type className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Add Text to Image</h3>
          <p className="text-muted-foreground">
            Select an image to start adding text compositions
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Canvas Preview */}
      <div className="lg:col-span-8">
        <Card className="bg-card border-border brutal-border brutal-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Type className="w-5 h-5" />
                Text Composition
              </CardTitle>
              <Button
                onClick={handleDownload}
                disabled={!canvasReady || textElements.length === 0}
                className="brutal-border bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-center items-center bg-secondary/20 rounded-lg brutal-border">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-lg"
                style={{ maxHeight: "500px" }}
              />
            </div>
            {loading && (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="animate-spin h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-muted-foreground text-sm">Processing image...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Text Controls */}
      <div className="lg:col-span-4">
        <ScrollArea className="h-[500px] lg:h-[600px]">
          <div className="space-y-4">
            {/* Add Text Button */}
            <Button 
              onClick={addNewText} 
              className="w-full brutal-border bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Text
            </Button>

            {/* Text Elements */}
            <Accordion type="multiple" className="space-y-2">
              {textElements.map((el, index) => (
                <AccordionItem 
                  value={el.id} 
                  key={el.id} 
                  className="border bg-card p-2 rounded-lg brutal-border"
                >
                  <AccordionTrigger className="text-sm hover:no-underline px-2 py-3 text-foreground">
                    Text {index + 1}: "{el.content.substring(0, 15)}{el.content.length > 15 ? '...' : ''}"
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-3 pt-3">
                    {/* Text Content */}
                    <div className="space-y-1">
                      <Label htmlFor={`text-content-${el.id}`} className="text-foreground font-medium text-xs uppercase tracking-wide">
                        Text Content
                      </Label>
                      <Input 
                        id={`text-content-${el.id}`}
                        value={el.content}
                        onChange={(e) => updateTextElement(el.id, { content: e.target.value })}
                        className="brutal-border bg-background text-foreground"
                        placeholder="Enter your text..."
                      />
                    </div>

                    {/* Font Size */}
                    <div className="space-y-1">
                      <Label className="flex items-center justify-between text-foreground font-medium text-xs uppercase">
                        Font Size
                        <span className="bg-secondary text-foreground px-2 py-1 rounded brutal-border text-xs font-bold">
                          {el.fontSize}px
                        </span>
                      </Label>
                      <Slider
                        value={[el.fontSize]}
                        onValueChange={(v) => updateTextElement(el.id, { fontSize: v[0] })}
                        min={10}
                        max={400}
                        step={1}
                        className="brutal-slider"
                      />
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-1">
                      <Label className="flex items-center justify-between text-foreground font-medium text-xs uppercase">
                        Font Weight
                        <span className="bg-secondary text-foreground px-2 py-1 rounded brutal-border text-xs font-bold">
                          {el.fontWeight}
                        </span>
                      </Label>
                      <Slider
                        value={[el.fontWeight]}
                        onValueChange={(v) => updateTextElement(el.id, { fontWeight: v[0] })}
                        min={100}
                        max={900}
                        step={100}
                        className="brutal-slider"
                      />
                    </div>

                    {/* Color */}
                    <div className="space-y-1">
                      <Label className="text-foreground font-medium text-xs uppercase">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={el.color.startsWith('rgba') ? '#ffffff' : el.color}
                          onChange={(e) => updateTextElement(el.id, { color: e.target.value })}
                          className="p-0 h-8 w-12 brutal-border"
                        />
                        <Input
                          value={el.color}
                          onChange={(e) => updateTextElement(el.id, { color: e.target.value })}
                          placeholder="rgba(R,G,B,A) or #hex"
                          className="flex-1 brutal-border bg-background text-foreground"
                        />
                      </div>
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-foreground font-medium text-xs uppercase">X Position</Label>
                        <Slider
                          value={[el.positionX]}
                          onValueChange={(v) => updateTextElement(el.id, { positionX: v[0] })}
                          min={0}
                          max={100}
                          step={1}
                          className="brutal-slider"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-foreground font-medium text-xs uppercase">Y Position</Label>
                        <Slider
                          value={[el.positionY]}
                          onValueChange={(v) => updateTextElement(el.id, { positionY: v[0] })}
                          min={0}
                          max={100}
                          step={1}
                          className="brutal-slider"
                        />
                      </div>
                    </div>

                    {/* Shadow Toggle */}
                    <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/20 rounded brutal-border">
                      <Label htmlFor={`shadow-toggle-${el.id}`} className="text-foreground font-medium text-xs uppercase">
                        Drop Shadow
                      </Label>
                      <Switch
                        id={`shadow-toggle-${el.id}`}
                        checked={el.hasShadow}
                        onCheckedChange={(checked) => updateTextElement(el.id, { hasShadow: checked })}
                      />
                    </div>

                    {/* Layer Toggle */}
                    <div className="flex items-center justify-between space-x-2 p-3 bg-yellow-600/20 rounded brutal-border border-yellow-500/30">
                      <Label htmlFor={`layer-toggle-${el.id}`} className="text-foreground font-medium text-xs uppercase">
                        Text Layer
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${!el.isForeground ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          Behind
                        </span>
                        <Switch
                          id={`layer-toggle-${el.id}`}
                          checked={el.isForeground}
                          onCheckedChange={(checked) => updateTextElement(el.id, { isForeground: checked })}
                        />
                        <span className={`text-xs ${el.isForeground ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          Front
                        </span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTextElement(el.id)}
                        className="brutal-border text-foreground hover:bg-secondary"
                      >
                        <Copy size={14} className="mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTextElement(el.id)}
                        className="brutal-border"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              
              {textElements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No text elements added.</p>
                  <p className="text-xs">Click "Add New Text" to begin.</p>
                </div>
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default TextComposer