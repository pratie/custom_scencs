"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePictureMeTemplates } from "@/lib/queries"

interface Template {
  name: string
  description: string
  icon: string
  variations: Array<{
    id: string
    name: string
    description: string
  }>
}

interface TemplateCardProps {
  id: string
  template: Template
  isSelected: boolean
  onSelect: (templateId: string) => void
  disabled?: boolean
}

function TemplateCard({ id, template, isSelected, onSelect, disabled }: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer p-6 transition-all duration-300 transform hover:scale-105 border-2 ${
        isSelected
          ? 'border-secondary bg-secondary/10 shadow-lg ring-1 ring-secondary/20'
          : 'border-border bg-card hover:border-secondary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(id)}
    >
      <div className="text-center space-y-3">
        <div className="text-4xl">{template.icon}</div>
        <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>

        {/* Show variations count */}
        <div className="pt-2">
          <span className="text-xs text-muted-foreground">
            {template.variations.length} variations
          </span>
        </div>
      </div>
    </Card>
  )
}

interface TemplateSelectorProps {
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string) => void
  disabled?: boolean
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  disabled = false
}: TemplateSelectorProps) {
  const { data: templatesData, isLoading, error } = usePictureMeTemplates()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Choose a Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-muted rounded-full mx-auto"></div>
                <div className="h-5 bg-muted rounded-md"></div>
                <div className="h-4 bg-muted rounded-md"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Choose a Theme</h2>
        <Card className="p-6 border-destructive/50">
          <div className="text-center text-destructive">
            <p>Failed to load templates</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const templates = templatesData?.templates || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Choose a Theme</h2>
        <p className="text-muted-foreground mt-2">
          Each theme generates 3 unique variations of your photo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([templateId, template]) => (
          <TemplateCard
            key={templateId}
            id={templateId}
            template={template as Template}
            isSelected={selectedTemplate === templateId}
            onSelect={onTemplateSelect}
            disabled={disabled}
          />
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{templates[selectedTemplate]?.icon}</span>
            <div>
              <h4 className="font-semibold text-foreground">
                {templates[selectedTemplate]?.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                Ready to generate 3 variations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}