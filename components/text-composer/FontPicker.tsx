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
  trending: <Zap className="w-3 h-3 md:w-4 md:h-4" />,
  bold: <Star className="w-3 h-3 md:w-4 md:h-4" />,
  clean: <Palette className="w-3 h-3 md:w-4 md:h-4" />,
  creative: <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
} as const

const CATEGORY_LABELS = {
  trending: "Trending",
  bold: "Bold",
  clean: "Clean", 
  creative: "Creative"
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
          "w-full justify-start h-auto p-3 md:p-4 text-left hover:bg-secondary/30 transition-all duration-200 touch-manipulation rounded-lg",
          isSelected && "bg-yellow-500/15 border border-yellow-400/40 hover:bg-yellow-500/20"
        )}
        onClick={() => handleFontSelect(font.name)}
      >
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Font Name */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {font.display}
              </span>
              {isRecommended && (
                <div className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                  POV
                </div>
              )}
            </div>
            
            {/* Font Preview */}
            <div 
              className={cn(
                "text-lg md:text-xl text-foreground/80 leading-tight transition-all duration-200",
                loadedFonts.has(font.name) && `font-['${getFontFamily(font.name)}']`
              )}
              style={loadedFonts.has(font.name) ? { fontFamily: getFontFamily(font.name) } : {}}
            >
              <span className="block">BOLD TEXT</span>
              <span className="text-sm text-muted-foreground block mt-1">Perfect for POV content</span>
            </div>
          </div>
          
          {/* Selection Indicator */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-black" />
              </div>
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
            )}
          </div>
        </div>
      </Button>
    )
  }

  const CategoryTab: React.FC<{ category: FontCategory }> = ({ category }) => (
    <TabsTrigger 
      value={category} 
      className="flex items-center justify-center gap-1.5 text-xs font-medium touch-manipulation px-2 h-10 md:h-12 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm min-w-0"
    >
      {CATEGORY_ICONS[category]}
      <span className="hidden sm:inline truncate">{CATEGORY_LABELS[category]}</span>
      <span className="sm:hidden text-xs">
        {category === 'trending' && 'Hot'}
        {category === 'bold' && 'Bold'} 
        {category === 'clean' && 'Clean'}
        {category === 'creative' && 'Fun'}
      </span>
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
            "w-full justify-between brutal-border bg-background text-foreground hover:bg-secondary/50 h-8 md:h-10 touch-manipulation",
            isOpen && "ring-2 ring-yellow-500/30"
          )}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <span 
              className={cn(
                "font-medium transition-all duration-200 text-xs md:text-sm",
                loadedFonts.has(currentFont) && `font-['${getFontFamily(currentFont)}']`
              )}
              style={loadedFonts.has(currentFont) ? { fontFamily: getFontFamily(currentFont) } : {}}
            >
              {currentFont}
            </span>
            {POV_RECOMMENDED_FONTS.includes(currentFont as any) && (
              <div className="bg-yellow-600 text-black px-1 md:px-1.5 py-0.5 rounded text-xs font-bold">
                POV
              </div>
            )}
          </div>
          <ChevronDown className={cn(
            "w-3 h-3 md:w-4 md:h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden max-h-[70vh] md:max-h-none">
            <div className="p-4 md:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Choose Font Family
              </h3>
              
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as FontCategory)}>
                <TabsList className="grid w-full grid-cols-4 gap-0.5 bg-gray-100 h-10 md:h-12 rounded-lg p-1">
                  <CategoryTab category="trending" />
                  <CategoryTab category="bold" />
                  <CategoryTab category="clean" />
                  <CategoryTab category="creative" />
                </TabsList>

                <div className="mt-3 md:mt-4">
                  {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <ScrollArea className="h-60 md:h-72">
                        <div className="space-y-2 pr-2">
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
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span><span className="font-semibold text-yellow-600">POV</span> fonts work best for viral content</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FontPicker