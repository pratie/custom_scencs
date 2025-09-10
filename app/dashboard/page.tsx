"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Send, User, Bot, Paperclip, Eye, Plus, MessageSquare, Trash2, Download, Video, Loader2, Library, LogOut, Settings, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { ChatMessage, GeneratedImage, GeneratedVideo, Conversation } from "@/lib/indexeddb"
import {
  useConversations,
  useCurrentConversation,
  useSaveConversation,
  useDeleteConversation,
  useGenerateImage,
  useGenerateVideo,
  useGenerateAvatar,
  useVideoStatus,
} from "@/lib/queries"
import modelEndpoints from "@/lib/model-endpoints.json"
import { useUsageLimits } from "@/lib/usage-limits"

// Load dev utils in development
if (process.env.NODE_ENV === 'development') {
  import("@/lib/dev-utils")
}

export default function ImageEditor() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<GeneratedImage | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isHistoryAnimating, setIsHistoryAnimating] = useState(false)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [localGeneratedImages, setLocalGeneratedImages] = useState<GeneratedImage[]>([])
  const [localGeneratedVideos, setLocalGeneratedVideos] = useState<GeneratedVideo[]>([])
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoPrompt, setVideoPrompt] = useState("")
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<GeneratedImage | null>(null)
  const [activeVideoTaskId, setActiveVideoTaskId] = useState<string | null>(null)
  const [videoType, setVideoType] = useState<"veo3" | "avatar">("veo3")
  const [avatarText, setAvatarText] = useState("")
  const [avatarVoice, setAvatarVoice] = useState("Alice")
  const [avatarPrompt, setAvatarPrompt] = useState("")
  const [avatarResolution, setAvatarResolution] = useState("480p")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations = [], refetch: refetchConversations } = useConversations(session?.user?.email || undefined)
  const { data: currentConversation } = useCurrentConversation(currentConversationId)
  
  // Usage limits hook
  const usageLimits = useUsageLimits()
  
  // Check for any processing videos across all conversations on startup
  useEffect(() => {
    if (conversations.length > 0 && !activeVideoTaskId) {
      for (const conversation of conversations) {
        const processingVideo = conversation.generatedVideos?.find(v => v.status === "processing")
        if (processingVideo?.taskId) {
          console.log("[v0] Found processing video on startup, resuming polling:", processingVideo.taskId)
          setActiveVideoTaskId(processingVideo.taskId)
          // Load this conversation if no current conversation
          if (!currentConversationId) {
            setCurrentConversationId(conversation.id)
          }
          break // Only resume one at a time
        }
      }
    }
  }, [conversations, activeVideoTaskId, currentConversationId])
  const saveConversation = useSaveConversation()
  const deleteConversation = useDeleteConversation()
  const generateImageMutation = useGenerateImage()
  const generateVideoMutation = useGenerateVideo()
  const generateAvatarMutation = useGenerateAvatar()
  const { data: videoStatus } = useVideoStatus(activeVideoTaskId, !!activeVideoTaskId)


  useEffect(() => {
    if (currentConversation) {
      setLocalMessages(currentConversation.messages || [])
      const limitedImages = (currentConversation.generatedImages || []).slice(0, 20)
      setLocalGeneratedImages(limitedImages)
      setLocalGeneratedVideos(currentConversation.generatedVideos || [])
      
      // Resume video status polling for any processing videos
      const processingVideo = currentConversation.generatedVideos?.find(v => v.status === "processing")
      if (processingVideo?.taskId && !activeVideoTaskId) {
        console.log("[v0] Resuming video status polling for task:", processingVideo.taskId)
        setActiveVideoTaskId(processingVideo.taskId)
      }
      
      if (limitedImages.length > 0) {
        const latestImage = limitedImages[0]
        setSelectedVersion(latestImage)
        setSelectedImage(latestImage.url)
      }
    }
  }, [currentConversation, activeVideoTaskId])

  useEffect(() => {
    if (currentConversationId && (localMessages.length > 0 || localGeneratedImages.length > 0)) {
      const title =
        localMessages.length > 0
          ? localMessages[0].content.slice(0, 50) + (localMessages[0].content.length > 50 ? "..." : "")
          : "New Conversation"

      const limitedMessages = localMessages.slice(-50)
      const limitedImages = localGeneratedImages.slice(0, 20)

      console.log("[v0] Saving conversation with messages:", limitedMessages.length, "images:", limitedImages.length)

      saveConversation.mutate(
        {
          id: currentConversationId,
          userId: session?.user?.email || currentConversation?.userId || "", // Preserve user ID
          title,
          messages: limitedMessages,
          generatedImages: limitedImages,
          generatedVideos: localGeneratedVideos,
          createdAt: currentConversation?.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
        {
          onSuccess: () => {
            console.log("[v0] Conversation saved successfully")
            refetchConversations()
          },
          onError: (error) => {
            console.error("[v0] Failed to save conversation:", error)
          },
        },
      )
    }
  }, [localMessages, localGeneratedImages, localGeneratedVideos, currentConversationId, currentConversation?.createdAt])

  const toggleHistory = useCallback(() => {
    if (showHistory) {
      setIsHistoryAnimating(false)
      setTimeout(() => {
        setShowHistory(false)
      }, 300)
    } else {
      setShowHistory(true)
      setTimeout(() => {
        setIsHistoryAnimating(true)
      }, 10)
    }
  }, [showHistory])

  const createNewConversation = useCallback(() => {
    if (!session?.user?.email) return

    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      userId: session.user.email, // Add user ID to conversation
      title: "New Conversation",
      messages: [],
      generatedImages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveConversation.mutate(newConversation, {
      onSuccess: () => {
        refetchConversations()
      },
    })

    setCurrentConversationId(newId)
    setLocalMessages([])
    setLocalGeneratedImages([])
    setSelectedImage(null)
    setSelectedVersion(null)
    setPrompt("")
  }, [saveConversation, refetchConversations, session?.user?.email])

  const loadConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId)
  }, [])

  const handleDeleteConversation = useCallback(
    (conversationId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (deleteConversation.isPending) {
        return
      }

      console.log("[v0] Attempting to delete conversation:", conversationId)

      deleteConversation.mutate(conversationId, {
        onSuccess: () => {
          console.log("[v0] Successfully deleted conversation:", conversationId)
          refetchConversations()

          if (currentConversationId === conversationId) {
            console.log("[v0] Deleted conversation was current, switching to another")
            if (conversations.length > 1) {
              const remaining = conversations.filter((c) => c.id !== conversationId)
              if (remaining.length > 0) {
                loadConversation(remaining[0].id)
              } else {
                createNewConversation()
              }
            } else {
              createNewConversation()
            }
          }
        },
        onError: (error) => {
          console.error("[v0] Failed to delete conversation:", error)
        },
      })
    },
    [
      currentConversationId,
      conversations,
      loadConversation,
      createNewConversation,
      deleteConversation,
      refetchConversations,
    ],
  )

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setSelectedImage(result)
          if (localGeneratedImages.length === 0) {
            const originalImage: GeneratedImage = {
              id: Date.now().toString() + "_original",
              url: result,
              prompt: "Original image",
              timestamp: Date.now(),
              model: "Original",
            }
            setLocalGeneratedImages([originalImage])
            setSelectedVersion(originalImage)
          }
        }
        reader.onerror = () => {
          console.error("[v0] FileReader error")
          reader.abort()
        }
        reader.readAsDataURL(file)
      }
      if (event.target) {
        event.target.value = ""
      }
    },
    [localGeneratedImages.length],
  )

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("[v0] Audio notification not supported:", error)
    }
  }, [])

  const handleGenerateImage = useCallback(async () => {
    if (!prompt) return

    const attachmentImage = selectedImage || (localGeneratedImages.length > 0 ? localGeneratedImages[0].url : null)
    if (!attachmentImage) return

    // Check usage limits
    if (!usageLimits.canUseImages()) {
      const remaining = usageLimits.getRemainingImages()
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "_limit",
        type: "assistant",
        content: `⚠️ Daily image editing limit reached! You can edit ${remaining > 0 ? remaining : 10} more images tomorrow. This helps us manage costs during MVP testing.`,
        timestamp: Date.now(),
      }
      setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
      return
    }

    let conversationId = currentConversationId

    if (!conversationId) {
      conversationId = Date.now().toString()
      setCurrentConversationId(conversationId)
    }

    if (localGeneratedImages.length === 0 && selectedImage) {
      const originalImage: GeneratedImage = {
        id: Date.now().toString() + "_original",
        url: selectedImage,
        prompt: "Original image",
        timestamp: Date.now(),
        model: "Original",
      }
      setLocalGeneratedImages([originalImage])
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: prompt,
      image: attachmentImage,
      timestamp: Date.now(),
    }

    const updatedMessages = [...localMessages.slice(-49), userMessage]
    setLocalMessages(updatedMessages)

    const modelDisplayName = "Nano Banana Edit"

    generateImageMutation.mutate(
      { prompt, imageUrl: attachmentImage },
      {
        onSuccess: (data) => {
          const newImage: GeneratedImage = {
            id: Date.now().toString() + "_gen",
            url: data.imageUrl,
            prompt,
            timestamp: Date.now(),
            model: modelDisplayName,
          }

          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + "_assistant",
            type: "assistant",
            content: "Here's your edited image:",
            generatedImage: newImage,
            timestamp: Date.now(),
          }

          setLocalGeneratedImages((prev) => {
            const newImages = [newImage, ...prev]
            if (newImages.length > 20) {
              return newImages.slice(0, 20)
            }
            return newImages
          })

          setLocalMessages((prev) => [...prev.slice(-49), assistantMessage])
          setSelectedVersion(newImage)
          setSelectedImage(newImage.url)
          setPrompt("")

          // Record usage after successful generation
          usageLimits.recordImageUse()

          playNotificationSound()
        },
        onError: (error) => {
          console.error("Error generating image:", error)
          const errorMessage: ChatMessage = {
            id: Date.now().toString() + "_error",
            type: "assistant",
            content: `Sorry, there was an error generating your image: ${error.message || "Unknown error occurred"}`,
            timestamp: Date.now(),
          }
          setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
        },
      },
    )
  }, [
    prompt,
    selectedImage,
    localGeneratedImages,
    currentConversationId,
    generateImageMutation,
    modelEndpoints,
    localMessages,
    playNotificationSound,
  ])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleGenerateVideo = useCallback(async () => {
    if (!videoPrompt || !selectedImageForVideo) return

    // Check usage limits for motion videos
    if (!usageLimits.canUseVideos()) {
      const remaining = usageLimits.getRemainingVideos()
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "_video_limit",
        type: "assistant",
        content: `⚠️ Daily motion video limit reached! You can generate ${remaining > 0 ? remaining : 3} more videos tomorrow. This helps us manage costs during MVP testing.`,
        timestamp: Date.now(),
      }
      setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
      return
    }

    const newVideo: GeneratedVideo = {
      id: Date.now().toString() + "_video",
      taskId: "",
      imageId: selectedImageForVideo.id,
      prompt: videoPrompt,
      status: "processing",
      timestamp: Date.now(),
      type: "veo3", // Mark as Veo3 motion video
    }

    setLocalGeneratedVideos((prev) => [newVideo, ...prev])

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: `Generate video: ${videoPrompt}`,
      image: selectedImageForVideo.url,
      timestamp: Date.now(),
    }

    setLocalMessages((prev) => [...prev.slice(-49), userMessage])

    generateVideoMutation.mutate(
      { prompt: videoPrompt, imageUrl: selectedImageForVideo.url },
      {
        onSuccess: (data) => {
          setActiveVideoTaskId(data.taskId)
          
          const updatedVideo = {
            ...newVideo,
            taskId: data.taskId,
          }
          
          setLocalGeneratedVideos((prev) =>
            prev.map((v) => (v.id === newVideo.id ? updatedVideo : v))
          )

          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + "_assistant",
            type: "assistant",
            content: "Video generation started! This will take 2-3 minutes...",
            generatedVideo: updatedVideo,
            timestamp: Date.now(),
          }

          setLocalMessages((prev) => [...prev.slice(-49), assistantMessage])
          
          // Record usage after successful video start
          usageLimits.recordVideoUse()
          
          setShowVideoModal(false)
          setVideoPrompt("")
          setSelectedImageForVideo(null)
        },
        onError: (error: any) => {
          console.error("Error generating video:", error)
          
          const errorMsg = error.message || "Unknown error"
          
          setLocalGeneratedVideos((prev) =>
            prev.map((v) =>
              v.id === newVideo.id ? { ...v, status: "failed", error: errorMsg } : v
            )
          )

          const errorMessage: ChatMessage = {
            id: Date.now().toString() + "_error",
            type: "assistant",
            content: errorMsg.includes("KIE API key") 
              ? "⚠️ Video generation requires a KIE API key. Please add your key to .env.local file. Get one from https://kie.ai/api-key"
              : errorMsg.includes("Images size exceeds limit")
              ? "⚠️ Image size is too large for video generation. Please try with a smaller image or different image version."
              : `Failed to generate video: ${errorMsg}`,
            timestamp: Date.now(),
          }
          setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
          setShowVideoModal(false)
          setVideoPrompt("")
          setSelectedImageForVideo(null)
        },
      }
    )
  }, [videoPrompt, selectedImageForVideo, generateVideoMutation])

  const handleGenerateAvatar = useCallback(async () => {
    if (!avatarText || !selectedImageForVideo || !avatarVoice) return

    // Check usage limits for avatar videos
    if (!usageLimits.canUseAvatars()) {
      const remaining = usageLimits.getRemainingAvatars()
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "_avatar_limit",
        type: "assistant",
        content: `⚠️ Daily avatar video limit reached! You can generate ${remaining > 0 ? remaining : 2} more avatars tomorrow. This helps us manage costs during MVP testing.`,
        timestamp: Date.now(),
      }
      setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
      return
    }

    const newVideo: GeneratedVideo = {
      id: Date.now().toString() + "_avatar",
      taskId: "", // Avatar generation is synchronous, no taskId needed
      imageId: selectedImageForVideo.id,
      prompt: avatarPrompt,
      text: avatarText,
      voice: avatarVoice,
      type: "avatar",
      status: "processing",
      timestamp: Date.now(),
      resolution: avatarResolution,
    }

    setLocalGeneratedVideos((prev) => [newVideo, ...prev])

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: `Generate talking avatar: "${avatarText}"`,
      image: selectedImageForVideo.url,
      timestamp: Date.now(),
    }

    setLocalMessages((prev) => [...prev.slice(-49), userMessage])

    generateAvatarMutation.mutate(
      { 
        text: avatarText, 
        imageUrl: selectedImageForVideo.url, 
        voice: avatarVoice,
        prompt: avatarPrompt,
        resolution: avatarResolution
      },
      {
        onSuccess: (data) => {
          const updatedVideo: GeneratedVideo = {
            ...newVideo,
            status: "completed",
            videoUrl: data.videoUrl,
            fileSize: data.fileSize,
          }
          
          setLocalGeneratedVideos((prev) =>
            prev.map((v) => (v.id === newVideo.id ? updatedVideo : v))
          )

          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + "_assistant",
            type: "assistant",
            content: "Talking avatar video generated! 🎬",
            generatedVideo: updatedVideo,
            timestamp: Date.now(),
          }

          setLocalMessages((prev) => [...prev.slice(-49), assistantMessage])
          
          // Record usage after successful avatar generation
          usageLimits.recordAvatarUse()
          
          setShowVideoModal(false)
          setAvatarText("")
          setAvatarPrompt("")
          setSelectedImageForVideo(null)
          playNotificationSound()
        },
        onError: (error: any) => {
          console.error("Error generating avatar video:", error)
          
          const errorMsg = error.message || "Unknown error"
          
          setLocalGeneratedVideos((prev) =>
            prev.map((v) =>
              v.id === newVideo.id ? { ...v, status: "failed", error: errorMsg } : v
            )
          )

          const errorMessage: ChatMessage = {
            id: Date.now().toString() + "_error",
            type: "assistant",
            content: errorMsg.includes("FAL API key") 
              ? "⚠️ Avatar generation requires a FAL API key. Please add your key to .env.local file."
              : `Failed to generate talking avatar: ${errorMsg}`,
            timestamp: Date.now(),
          }
          setLocalMessages((prev) => [...prev.slice(-49), errorMessage])
          setShowVideoModal(false)
          setAvatarText("")
          setAvatarPrompt("")
          setSelectedImageForVideo(null)
        },
      }
    )
  }, [avatarText, avatarVoice, avatarPrompt, avatarResolution, selectedImageForVideo, generateAvatarMutation, playNotificationSound])

  useEffect(() => {
    if (videoStatus && activeVideoTaskId) {
      console.log("[v0] Video status update received:", {
        taskId: activeVideoTaskId,
        status: videoStatus.status,
        hasVideoUrl: !!videoStatus.videoUrl,
        fullStatus: videoStatus
      })
      
      // Note: Avoid reading localGeneratedVideos here to prevent stale closures.
      // We rely on functional setState calls below to work with the latest state.
      
      // Update the video status in the UI even if still processing
      if (videoStatus.status === "processing" && videoStatus.message) {
        // Update the processing message with progress
        setLocalGeneratedVideos((prev) => {
          let changed = false
          const next = prev.map((v) => {
            if (v.taskId === activeVideoTaskId) {
              if (v.status !== "processing") {
                changed = true
                return { ...v, status: "processing" as const }
              }
            }
            return v
          })
          
          // Persist the processing status update to database
          if (changed && currentConversationId && currentConversation) {
            const updatedConversation = {
              ...currentConversation,
              generatedVideos: next,
              updatedAt: Date.now(),
            }
            saveConversation.mutate(updatedConversation)
          }
          
          return changed ? next : prev
        })
        
        // Update the most recent message for this task with progress text and status
        setLocalMessages((prev) => {
          const idx = [...prev].reverse().findIndex((m) => m.generatedVideo?.taskId === activeVideoTaskId)
          if (idx === -1) return prev
          const realIndex = prev.length - 1 - idx
          const target = prev[realIndex]
          const updated: ChatMessage = {
            ...target,
            content: videoStatus.message || "Video generation in progress...",
            generatedVideo: target.generatedVideo
              ? { ...target.generatedVideo, status: "processing" as const }
              : target.generatedVideo,
          }
          const next = [...prev]
          next[realIndex] = updated
          return next
        })
      } else if (videoStatus.status === "completed" && videoStatus.videoUrl) {
        console.log("[v0] Video completed! Updating UI with URL:", videoStatus.videoUrl)
        setLocalGeneratedVideos((prev) => {
          const idx = prev.findIndex((v) => v.taskId === activeVideoTaskId)
          if (idx === -1) return prev
          const current = prev[idx]
          // Avoid redundant updates
          if (current.status === "completed" && current.videoUrl === videoStatus.videoUrl) {
            return prev
          }
          const updated: GeneratedVideo = {
            ...current,
            status: "completed" as const,
            videoUrl: videoStatus.videoUrl,
            originUrl: videoStatus.originUrl,
            resolution: videoStatus.resolution,
          }
          const next = [...prev]
          next[idx] = updated
          
          // Persist the video status update to database
          if (currentConversationId && currentConversation) {
            const updatedConversation = {
              ...currentConversation,
              generatedVideos: next,
              updatedAt: Date.now(),
            }
            saveConversation.mutate(updatedConversation)
          }
          
          return next
        })
        setLocalMessages((prev) => {
          const idxFromEnd = [...prev].reverse().findIndex((m) => m.generatedVideo?.taskId === activeVideoTaskId)
          const mkCompletedVideo = (existing?: GeneratedVideo): GeneratedVideo => ({
            ...(existing ?? {
              id: Date.now().toString(),
              taskId: activeVideoTaskId!,
              imageId: "",
              prompt: "",
              timestamp: Date.now(),
              status: "completed" as const,
            }),
            status: "completed" as const,
            videoUrl: videoStatus.videoUrl!,
            originUrl: videoStatus.originUrl,
            resolution: videoStatus.resolution,
          })
          const completedMessage: ChatMessage = {
            id: Date.now().toString() + "_video_complete",
            type: "assistant",
            content: "Video generation completed! 🎬",
            generatedVideo: mkCompletedVideo(),
            timestamp: Date.now(),
          }
          if (idxFromEnd !== -1) {
            const realIndex = prev.length - 1 - idxFromEnd
            const target = prev[realIndex]
            const next = [...prev]
            next[realIndex] = {
              ...target,
              ...completedMessage,
              generatedVideo: mkCompletedVideo(target.generatedVideo),
            }
            return next
          }
          // If no matching message found, append
          return [...prev.slice(-49), completedMessage]
        })
        setActiveVideoTaskId(null)
        playNotificationSound()
      } else if (videoStatus.status === "failed") {
        console.log("[v0] Video generation failed:", videoStatus.error)
        setLocalGeneratedVideos((prev) => {
          let changed = false
          const next = prev.map((v) => {
            if (v.taskId === activeVideoTaskId) {
              if (v.status !== "failed" || v.error !== videoStatus.error) {
                changed = true
                return { ...v, status: "failed" as const, error: videoStatus.error }
              }
            }
            return v
          })
          
          // Persist the failed video status to database
          if (changed && currentConversationId && currentConversation) {
            const updatedConversation = {
              ...currentConversation,
              generatedVideos: next,
              updatedAt: Date.now(),
            }
            saveConversation.mutate(updatedConversation)
          }
          
          return changed ? next : prev
        })
        
        setLocalMessages((prev) => {
          const idxFromEnd = [...prev].reverse().findIndex((m) => m.generatedVideo?.taskId === activeVideoTaskId)
          const errorMessage: ChatMessage = {
            id: Date.now().toString() + "_video_failed",
            type: "assistant",
            content: `Video generation failed: ${videoStatus.error || "Unknown error"}`,
            timestamp: Date.now(),
          }
          if (idxFromEnd !== -1) {
            const realIndex = prev.length - 1 - idxFromEnd
            const target = prev[realIndex]
            // If it's already a failed message for this task with same error, skip
            if (target.type === "assistant" && target.generatedVideo?.taskId === activeVideoTaskId && typeof target.content === "string" && target.content.startsWith("Video generation failed:")) {
              return prev
            }
            const next = [...prev]
            next[realIndex] = {
              ...target,
              ...errorMessage,
              generatedVideo: target.generatedVideo
                ? { ...target.generatedVideo, status: "failed" as const }
                : target.generatedVideo,
            }
            return next
          }
          // Otherwise append
          return [...prev.slice(-49), errorMessage]
        })
        setActiveVideoTaskId(null)
      }
    }
  }, [videoStatus, activeVideoTaskId, playNotificationSound])

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    scrollToBottom()
  }, [localMessages, localGeneratedImages, scrollToBottom])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">
          <div className="w-8 h-8 border-2 border-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null
  }

  return (
    <div
      className="h-screen bg-background flex flex-col relative"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="h-12 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHistory}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 px-2 transition-all duration-200 hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewConversation}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 px-2 transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          {/* Usage Stats */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded text-xs text-muted-foreground">
            <span>📝 {usageLimits.getRemainingImages()}</span>
            <span>🎬 {usageLimits.getRemainingVideos()}</span>
            <span>🗣️ {usageLimits.getRemainingAvatars()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/videos">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 px-2 transition-all duration-200 hover:scale-105"
              title="View Video Library"
            >
              <Library className="w-4 h-4 mr-1" />
              <span className="text-xs">Videos</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="w-7 h-7 rounded-full border border-border"
              />
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>

      {showHistory && (
        <>
          <div
            className={`fixed inset-0 bg-background/30 z-40 transition-all duration-300 ease-out ${
              isHistoryAnimating ? "opacity-100 backdrop-blur-sm" : "opacity-0"
            }`}
            onClick={toggleHistory}
          />
          <div
            className={`fixed top-12 left-0 w-80 h-[calc(100vh-3rem)] bg-card/95 backdrop-blur-xl border-t rounded-tr-lg border-r border-neutral-200/20 flex flex-col z-50 shadow-2xl transition-all duration-300 ease-out ${
              isHistoryAnimating ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b bg-card/50 border-neutral-200/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">History</h2>
              <Button
                onClick={createNewConversation}
                className="w-fit text-foreground hover:scale-105 transition-transform duration-200"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer mb-2 group hover:bg-secondary/80 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    currentConversationId === conversation.id ? "bg-secondary/60 ring-1 ring-neutral-200/20" : ""
                  }`}
                  onClick={() => loadConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">{conversation.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{conversation.messages.length} messages</p>
                      <p className="text-xs text-muted-foreground">{new Date(conversation.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteConversation.isPending}
                      className={`opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 hover:scale-110 ${
                        deleteConversation.isPending ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex">
        <div className="w-1/3 flex flex-col bg-background" style={{ minWidth: "400px" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-11rem)]">
            {localMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation by uploading an image and describing your edit</p>
                </div>
              </div>
            ) : (
              localMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-start" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary mt-0">
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                  <div className="max-w-[80%]">
                    <div className="rounded-lg px-3 pb-3  space-y-2 text-foreground">
                      {message.type === "assistant" && message.generatedImage && (
                        <div className="flex items-center gap-2 mb-2 pt-1">
                          {(() => {
                            const model = modelEndpoints.find((m) => m.label === message.generatedImage?.model)
                            return model ? (
                              <img
                                src={model.logo || "/placeholder.svg"}
                                alt={model.label}
                                className="w-4 h-4 flex-shrink-0"
                              />
                            ) : null
                          })()}
                          <span className="text-xs text-muted-foreground font-medium">{message.generatedImage.model}</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      {message.image && (
                        <img
                          src={message.image || "/placeholder.svg"}
                          alt="Uploaded"
                          className="w-auto h-9 rounded-lg border border-border hover:border-border transition-colors duration-200"
                        />
                      )}
                      {message.generatedImage && (
                        <div className="relative inline-block">
                          <img
                            src={message.generatedImage.url || "/placeholder.svg"}
                            alt="Generated"
                            className="w-auto h-9 rounded-lg border border-border hover:border-border transition-colors duration-200"
                          />
                          <div className="absolute -top-1 -right-1 bg-secondary text-foreground px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center">
                            v{(() => {
                              const imageIndex = localGeneratedImages.findIndex(
                                (img) => img.id === message.generatedImage?.id,
                              )
                              return imageIndex >= 0 ? localGeneratedImages.length - 1 - imageIndex : 1
                            })()}
                          </div>
                        </div>
                      )}
                      {message.generatedVideo && (
                        <div className="space-y-2">
                          {message.generatedVideo.status === "processing" ? (
                            <div className="p-3 bg-card rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-foreground">Generating video...</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Videos typically take 3-8 minutes to generate
                              </p>
                            </div>
                          ) : message.generatedVideo.status === "completed" && message.generatedVideo.videoUrl ? (
                            <div className="space-y-2">
                              <video
                                controls
                                className="w-full max-w-[300px] rounded-lg border border-border"
                                src={message.generatedVideo.videoUrl}
                              >
                                Your browser does not support the video tag.
                              </video>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = message.generatedVideo?.videoUrl || ""
                                  link.download = `video-${message.generatedVideo?.id}-${Date.now()}.mp4`
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                                className="text-xs border-border text-foreground hover:bg-secondary"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download Video
                              </Button>
                            </div>
                          ) : message.generatedVideo.status === "failed" ? (
                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                              <p className="text-sm text-red-400">
                                Video generation failed: {message.generatedVideo.error || "Unknown error"}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {generateImageMutation.isPending && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="px-3 pb-3 pt-1.5">
                    <div className="flex items-center gap-2">
                      <img src="/logos/fal.svg" alt="Loading" className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-foreground">Generating image...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-secondary/20">
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe how you want to edit the image..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generateImageMutation.isPending}
                className="flex-1 min-h-[60px] resize-none bg-background border-neutral-200/20 text-foreground placeholder-muted-foreground focus:border-border focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:shadow-lg focus:shadow-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerateImage()
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={generateImageMutation.isPending}
                  className="h-[28px] px-3 border border-border text-foreground hover:bg-secondary bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                  title="Upload image"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleGenerateImage}
                  disabled={
                    !prompt ||
                    (!selectedImage && localGeneratedImages.length === 0) ||
                    generateImageMutation.isPending ||
                    !usageLimits.canUseImages()
                  }
                  className="h-[28px] px-3 bg-secondary hover:bg-secondary text-foreground disabled:bg-secondary disabled:text-muted-foreground transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {(selectedImage || (localGeneratedImages.length > 0 && localGeneratedImages[0])) && (
              <div className="flex gap-2 mt-2">
                <div className="relative">
                  <img
                    src={selectedImage || localGeneratedImages[0]?.url || "/placeholder.svg"}
                    alt="Attachment"
                    className="w-9 h-9 rounded-lg object-cover border border-neutral-200/20 hover:border-border transition-colors duration-200"
                  />
                  <div className="absolute -top-1 -right-1 bg-secondary text-foreground px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center">
                    v
                    {selectedVersion
                      ? localGeneratedImages.findIndex((img) => img.id === selectedVersion.id) >= 0
                        ? localGeneratedImages.length -
                          1 -
                          localGeneratedImages.findIndex((img) => img.id === selectedVersion.id)
                        : 0
                      : localGeneratedImages.length > 0
                        ? localGeneratedImages.length - 1
                        : 0}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="w-2/3 flex flex-col relative overflow-hidden border-t border-l-2 border-border rounded-tl-lg bg-background backdrop-blur-sm">
          <div className="p-4 border-b border-border bg-secondary/30 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-foreground">Preview</h2>
            <p className="text-sm text-muted-foreground">
              {selectedVersion
                ? `Selected: v${localGeneratedImages.findIndex((img) => img.id === selectedVersion.id) >= 0 ? localGeneratedImages.length - 1 - localGeneratedImages.findIndex((img) => img.id === selectedVersion.id) : 0}`
                : localGeneratedImages.length > 0
                  ? `Latest: v${localGeneratedImages.length - 1}`
                  : "No images generated"}
            </p>
          </div>

          <div className="flex-1 relative p-6 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              {selectedImage || localGeneratedImages.length > 0 ? (
                <div className="relative group">
                  <img
                    src={
                      hoveredVersion
                        ? localGeneratedImages.find((img) => img.id === hoveredVersion)?.url || "/placeholder.svg"
                        : (selectedVersion || localGeneratedImages[0])?.url || selectedImage || "/placeholder.svg"
                    }
                    alt="Preview image"
                    className="max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl transition-all duration-300 group-hover:shadow-3xl"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentImage = hoveredVersion
                          ? localGeneratedImages.find((img) => img.id === hoveredVersion)
                          : selectedVersion || localGeneratedImages[0]
                        
                        if (currentImage) {
                          setSelectedImageForVideo(currentImage)
                          setShowVideoModal(true)
                        }
                      }}
                      className="bg-card/90 hover:bg-secondary/90 text-foreground border border-neutral-200/20 h-8 w-8 p-0 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                      title="Generate video from this image"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentImage = hoveredVersion
                          ? localGeneratedImages.find((img) => img.id === hoveredVersion)
                          : selectedVersion || localGeneratedImages[0]

                        if (currentImage?.url || selectedImage) {
                          const link = document.createElement("a")
                          link.href = currentImage?.url || selectedImage || ""
                          const versionNumber = currentImage
                            ? localGeneratedImages.findIndex((img) => img.id === currentImage.id) >= 0
                              ? localGeneratedImages.length -
                                1 -
                                localGeneratedImages.findIndex((img) => img.id === currentImage.id)
                              : 0
                            : 0
                          link.download = `image-edit-v${versionNumber}-${Date.now()}.png`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }
                      }}
                      className="bg-card/90 hover:bg-secondary/90 text-foreground border border-neutral-200/20 h-8 w-8 p-0 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Generated images will appear here</p>
                  <p className="text-sm mt-2">Start by uploading an image and describing your edit</p>
                </div>
              )}
            </div>

            {(selectedImage || localGeneratedImages.length > 0) && (
              <div className="mt-4 border-t border-neutral-200/20 pt-4">
                <div className="flex gap-2 justify-center flex-wrap">
                  {localGeneratedImages.map((image, index) => {
                    const versionNumber = localGeneratedImages.length - 1 - index
                    const isSelected = selectedVersion?.id === image.id
                    const isOriginalHighlighted =
                      !selectedVersion && versionNumber === 0 && localGeneratedImages.length === 1
                    const shouldHighlight = isSelected || isOriginalHighlighted

                    return (
                      <div
                        key={image.id}
                        className="relative"
                        onMouseEnter={() => setHoveredVersion(image.id)}
                        onMouseLeave={() => setHoveredVersion(null)}
                      >
                        <div
                          className={
                            "w-16 h-16 relative cursor-pointer hover:scale-110 transition-all duration-200 hover:shadow-lg"
                          }
                          onClick={() => {
                            setSelectedVersion(image)
                            setSelectedImage(image.url)
                          }}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Version ${versionNumber}`}
                            className={`w-full h-full object-cover rounded-lg border-2 transition-all duration-200 ${
                              shouldHighlight
                                ? "border-white shadow-lg shadow-white/20"
                                : "border-neutral-200/20 hover:border-border"
                            }`}
                          />
                          <div
                            className={`absolute -top-1 -right-1 px-1 py-0.5 rounded text-xs font-medium border transition-all duration-200 ${
                              shouldHighlight
                                ? "bg-secondary text-foreground border-border shadow-lg"
                                : "bg-card/90 text-foreground border-neutral-200/20 backdrop-blur-sm"
                            }`}
                          >
                            v{versionNumber}
                          </div>
                        </div>

                        {hoveredVersion === image.id && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 bg-card/95 backdrop-blur-xl border border-neutral-200/20 rounded-lg p-3 w-64 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground font-medium text-sm">Version {versionNumber}</span>
                                <span className="text-muted-foreground text-xs">
                                  {new Date(image.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-foreground text-sm">{image.prompt}</p>
                              {image.model && (
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const model = modelEndpoints.find((m) => m.label === image.model)
                                    return model ? (
                                      <img
                                        src={model.logo || "/placeholder.svg"}
                                        alt={model.label}
                                        className="w-4 h-4 flex-shrink-0"
                                      />
                                    ) : null
                                  })()}
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground text-xs">Model:</span>
                                    <span className="text-foreground text-xs font-medium">{image.model}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showVideoModal && selectedImageForVideo && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
          <div className="modal-brutal bg-card text-card-foreground w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 flex-shrink-0">
              <h2 className="text-xl font-semibold text-foreground mb-4">Generate Video</h2>
              
              {/* Image Preview */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">From image version:</p>
                <img
                  src={selectedImageForVideo.url}
                  alt="Selected for video"
                  className="w-full h-32 object-contain rounded-lg border border-neutral-200/20"
                />
              </div>
            </div>
            
            <div className="px-6 flex-1 overflow-y-auto">
              <Tabs value={videoType} onValueChange={(value) => setVideoType(value as "veo3" | "avatar")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="veo3" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Motion Video
                  </TabsTrigger>
                  <TabsTrigger value="avatar" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Talking Avatar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="veo3" className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Motion Prompt</label>
                    <Textarea
                      placeholder="Describe how the image should animate (e.g., 'zoom in slowly while panning left')"
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="h-32 bg-input border-border text-foreground placeholder-muted-foreground resize-none brutal-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creates motion-based videos in 9:16 format using Veo3 Fast (~3-8 minutes)
                  </p>
                </TabsContent>
                
                <TabsContent value="avatar" className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Text to Speak</label>
                    <Textarea
                      placeholder="What should the avatar say? (e.g., 'Hello! Welcome to our product demo.')"
                      value={avatarText}
                      onChange={(e) => setAvatarText(e.target.value)}
                      className="h-24 bg-input border-border text-foreground placeholder-muted-foreground resize-none brutal-border"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Voice</label>
                      <Select value={avatarVoice} onValueChange={setAvatarVoice}>
                        <SelectTrigger className="bg-input border-border text-foreground brutal-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border brutal-border">
                          {["Alice", "Aria", "Callum", "Charlie", "Charlotte", "Eric", "George", "Jessica", "Laura", "Liam", "Matilda", "River", "Roger", "Sarah", "Will"].map((voice) => (
                            <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Resolution</label>
                      <Select value={avatarResolution} onValueChange={setAvatarResolution}>
                        <SelectTrigger className="bg-input border-border text-foreground brutal-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border brutal-border">
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Scene Description (Optional)</label>
                    <Textarea
                      placeholder="Describe the avatar/scene (e.g., 'A professional person speaking to camera')"
                      value={avatarPrompt}
                      onChange={(e) => setAvatarPrompt(e.target.value)}
                      className="h-20 bg-input border-border text-foreground placeholder-muted-foreground resize-none brutal-border"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Creates lip-synced talking avatar with automatic text-to-speech (~30-60 seconds)
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="p-6 flex-shrink-0 border-t border-neutral-200/20">
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowVideoModal(false)
                    setVideoPrompt("")
                    setAvatarText("")
                    setAvatarPrompt("")
                    setSelectedImageForVideo(null)
                  }}
                  variant="outline"
                  className="btn-brutal btn-brutal-blue flex-1 bg-secondary text-secondary-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={videoType === "veo3" ? handleGenerateVideo : handleGenerateAvatar}
                  disabled={
                    videoType === "veo3" 
                      ? (!videoPrompt || generateVideoMutation.isPending || !usageLimits.canUseVideos())
                      : (!avatarText || !avatarVoice || generateAvatarMutation.isPending || !usageLimits.canUseAvatars())
                  }
                  className="btn-brutal btn-brutal-red flex-1 bg-primary text-primary-foreground"
                >
                  {(videoType === "veo3" ? generateVideoMutation.isPending : generateAvatarMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      {videoType === "veo3" ? (
                        <Video className="w-4 h-4 mr-2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      Generate {videoType === "veo3" ? "Motion Video" : "Talking Avatar"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
