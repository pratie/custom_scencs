"use client"

import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"
import { useRef } from "react"

export default function TestPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Upload Button Test</h1>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-3 border-neutral-200/20"
        >
          <Paperclip className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => alert(`Selected: ${e.target.files?.[0]?.name}`)}
        />
      </div>
    </div>
  )
}