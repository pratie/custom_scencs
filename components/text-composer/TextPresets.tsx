"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TEXT_PRESETS, applyPresetToTextElement, type TextPreset } from "@/lib/text-presets"
import { TextElement } from "@/lib/indexeddb"
import { cn } from "@/lib/utils"

interface TextPresetsProps {
  onApplyPreset: (updatedElement: Partial<TextElement>) => void
  className?: string
}

const TextPresets: React.FC<TextPresetsProps> = ({ onApplyPreset, className }) => {
  const handlePresetClick = (preset: TextPreset) => {
    onApplyPreset(preset.style)
  }

  const PresetButton: React.FC<{ preset: TextPreset }> = ({ preset }) => (
    <Button
      variant="outline"
      onClick={() => handlePresetClick(preset)}
      className={cn(
        "h-auto p-3 text-left hover:bg-yellow-600/10 hover:border-yellow-500/30 transition-all duration-200 brutal-border",
        "flex flex-col items-start gap-1"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="text-lg">{preset.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs uppercase tracking-wide text-foreground">
            {preset.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {preset.description}
          </div>
        </div>
      </div>
      <div className="w-full mt-1">
        <div 
          className="text-sm font-medium truncate"
          style={{
            fontFamily: preset.style.fontFamily,
            color: preset.style.color,
            fontWeight: preset.style.fontWeight
          }}
        >
          {preset.style.content}
        </div>
      </div>
    </Button>
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-foreground font-bold text-xs uppercase tracking-wide">
        Quick Presets
      </Label>
      
      <ScrollArea className="h-32">
        <div className="grid grid-cols-2 gap-2 pr-2">
          {TEXT_PRESETS.map((preset) => (
            <PresetButton key={preset.id} preset={preset} />
          ))}
        </div>
      </ScrollArea>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 Click any preset to apply the style instantly
        </p>
      </div>
    </div>
  )
}

export default TextPresets