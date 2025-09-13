"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Camera, X } from "lucide-react"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageDataUrl: string) => void
}

function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (videoRef.current) {
      setCameraError(null)
      try {
        stopCamera()
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1024 }, height: { ideal: 1024 }, facingMode: 'user' }
        })
        videoRef.current.srcObject = stream
        streamRef.current = stream
      } catch (err) {
        console.error("Error accessing camera:", err)
        setCameraError("Camera access denied. Please allow camera access in your browser settings.")
      }
    }
  }, [stopCamera])

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, capturedImage, startCamera, stopCamera])

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.scale(-1, 1) // Flip horizontally for selfie view
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/png')
        setCapturedImage(dataUrl)
      }
    }
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onClose()
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xl w-full max-w-2xl text-center relative">
        <h3 className="text-2xl font-semibold mb-4 text-foreground">Camera</h3>

        <div className="aspect-square bg-black rounded-lg overflow-hidden relative mb-4 flex items-center justify-center">
          {cameraError ? (
            <div className="p-4 text-destructive">{cameraError}</div>
          ) : (
            <>
              {capturedImage ? (
                <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}
            </>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {capturedImage ? (
            <>
              <Button onClick={handleRetake} variant="outline">
                Retake
              </Button>
              <Button onClick={handleConfirm}>
                Use Photo
              </Button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          )}
        </div>

        <button
          onClick={() => {
            setCapturedImage(null)
            onClose()
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

interface PhotoUploaderProps {
  uploadedImage: string | null
  onImageUpload: (imageDataUrl: string) => void
  disabled?: boolean
}

export default function PhotoUploader({
  uploadedImage,
  onImageUpload,
  disabled = false
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        const base64Image = await toBase64(file)
        onImageUpload(base64Image)
      } catch (error) {
        console.error("Error during image upload:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleCameraCapture = (imageDataUrl: string) => {
    onImageUpload(imageDataUrl)
  }

  const handleCardClick = () => {
    if (!uploadedImage && !disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <>
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Your Photo</h2>
          <p className="text-muted-foreground mt-2">
            Upload a clear photo or take one with your camera
          </p>
        </div>

        <Card
          className={`aspect-square border-4 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-secondary transition-colors overflow-hidden shadow-inner ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleCardClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Uploading...</p>
            </div>
          ) : uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg text-foreground">Click to upload a file</p>
                <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsCameraOpen(true)
                  }}
                  variant="outline"
                  className="mt-2"
                  disabled={disabled}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </Button>
              </div>
            </div>
          )}
        </Card>

        {uploadedImage && !isUploading && (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
              disabled={disabled}
            >
              Change File
            </Button>
            <Button
              onClick={() => setIsCameraOpen(true)}
              variant="outline"
              className="flex-1"
              disabled={disabled}
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept="image/png,image/jpeg"
          className="hidden"
        />
      </div>
    </>
  )
}