"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Star, Zap, Palette, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { 
  FONT_CATEGORIES, 
  POV_RECOMMENDED_FONTS, 
  getFontFamily, 
  loadGoogleFonts,
  type FontCategory,
  type FontData 
} from "@/lib/fonts"

interface FontPickerProps {
  currentFont: string
  onFontChange: (fontName: string) => void
  className?: string
}

const CATEGORY_ICONS = {
  trending: <Zap className="w-4 h-4" />,
  bold: <Star className="w-4 h-4" />,
  clean: <Palette className="w-4 h-4" />,
  creative: <Sparkles className="w-4 h-4" />
} as const

const CATEGORY_LABELS = {
  trending: "Trending",
  bold: "Bold & Impact",
  clean: "Clean & Modern", 
  creative: "Creative & Fun"
} as const

const FontPicker: React.FC<FontPickerProps> = ({ 
  currentFont, 
  onFontChange, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<FontCategory>("trending")

  // Preload recommended fonts
  useEffect(() => {
    const fontsToLoad = [...POV_RECOMMENDED_FONTS, currentFont].filter(Boolean)
    loadGoogleFonts(fontsToLoad as string[])
      .then(() => {
        setLoadedFonts(prev => new Set([...prev, ...fontsToLoad]))
      })
      .catch(console.error)
  }, [currentFont])

  const handleFontSelect = async (fontName: string) => {
    try {
      // Load the font if not already loaded
      if (!loadedFonts.has(fontName)) {
        await loadGoogleFonts([fontName])
        setLoadedFonts(prev => new Set([...prev, fontName]))
      }
      
      onFontChange(fontName)
      setIsOpen(false)
    } catch (error) {
      console.error("Error loading font:", error)
      // Still allow font selection even if loading fails
      onFontChange(fontName)
      setIsOpen(false)
    }
  }

  const FontPreview: React.FC<{ font: FontData; isSelected: boolean }> = ({ 
    font, 
    isSelected 
  }) => {
    const isRecommended = POV_RECOMMENDED_FONTS.includes(font.name as any)
    
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-auto p-3 text-left hover:bg-secondary/50 transition-all duration-200",
          isSelected && "bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30"
        )}
        onClick={() => handleFontSelect(font.name)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {font.display}
              </span>
              {isRecommended && (
                <div className="bg-yellow-600 text-black px-1.5 py-0.5 rounded text-xs font-bold">
                  POV
                </div>
              )}
            </div>
            <p 
              className={cn(
                "text-lg text-foreground truncate transition-all duration-200",
                loadedFonts.has(font.name) && `font-['${getFontFamily(font.name)}']`
              )}
              style={loadedFonts.has(font.name) ? { fontFamily: getFontFamily(font.name) } : {}}
            >
              POV: You found the perfect font
            </p>
          </div>
          {isSelected && (
            <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 ml-2" />
          )}
        </div>
      </Button>
    )
  }

  const CategoryTab: React.FC<{ category: FontCategory }> = ({ category }) => (
    <TabsTrigger 
      value={category} 
      className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
    >
      {CATEGORY_ICONS[category]}
      {CATEGORY_LABELS[category]}
    </TabsTrigger>
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-foreground font-bold text-xs uppercase tracking-wide">
        Font Family
      </Label>
      
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between brutal-border bg-background text-foreground hover:bg-secondary/50",
            isOpen && "ring-2 ring-yellow-500/30"
          )}
        >
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                "font-medium transition-all duration-200",
                loadedFonts.has(currentFont) && `font-['${getFontFamily(currentFont)}']`
              )}
              style={loadedFonts.has(currentFont) ? { fontFamily: getFontFamily(currentFont) } : {}}
            >
              {currentFont}
            </span>
            {POV_RECOMMENDED_FONTS.includes(currentFont as any) && (
              <div className="bg-yellow-600 text-black px-1.5 py-0.5 rounded text-xs font-bold">
                POV
              </div>
            )}
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border brutal-border brutal-shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                Choose Font Family
              </h3>
              
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as FontCategory)}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 bg-secondary/20">
                  <CategoryTab category="trending" />
                  <CategoryTab category="bold" />
                  <CategoryTab category="clean" />
                  <CategoryTab category="creative" />
                </TabsList>

                <div className="mt-4">
                  {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <ScrollArea className="h-64">
                        <div className="space-y-1 pr-2">
                          {fonts.map((font) => (
                            <FontPreview
                              key={font.name}
                              font={font}
                              isSelected={font.name === currentFont}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
              
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  💡 <span className="font-medium text-yellow-600">POV</span> fonts are optimized for viral thumbnails
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FontPicker