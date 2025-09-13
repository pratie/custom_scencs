import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { conversationDB, type Conversation, type GeneratedVideo, type PictureMeSession } from "./indexeddb"
import { useEffect } from "react"

// Query keys
export const queryKeys = {
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversation", id] as const,
  pictureMeSessions: ["pictureMeSessions"] as const,
  pictureMeSession: (id: string) => ["pictureMeSession", id] as const,
  pictureMeTemplates: ["pictureMeTemplates"] as const,
}

// Conversations hook with user filtering
export function useConversations(userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.conversations, userId],
    queryFn: async () => {
      await conversationDB.init()
      return conversationDB.getAllConversations(userId)
    },
    enabled: !!userId, // Only run if userId is provided
  })
}

// Current conversation hook
export function useCurrentConversation(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId || ""),
    queryFn: async () => {
      if (!conversationId) return null
      return conversationDB.getConversation(conversationId)
    },
    enabled: !!conversationId,
  })
}

// Mutation hooks
export function useSaveConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversation: Conversation) => {
      await conversationDB.saveConversation(conversation)
      return conversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      console.log("[v0] Deleting conversation from database:", conversationId)
      await conversationDB.deleteConversation(conversationId)
      console.log("[v0] Successfully deleted from database:", conversationId)
      return conversationId
    },
    onSuccess: async (conversationId) => {
      console.log("[v0] Invalidating queries after delete:", conversationId)
      queryClient.removeQueries({ queryKey: queryKeys.conversation(conversationId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
      await queryClient.refetchQueries({ queryKey: queryKeys.conversations, type: "active" })
      // Force immediate cache update
      queryClient.setQueryData(queryKeys.conversations, (oldData: Conversation[] | undefined) => {
        if (!oldData) return []
        return oldData.filter((conv) => conv.id !== conversationId)
      })
    },
    onError: (error) => {
      console.error("[v0] Delete conversation mutation failed:", error)
    },
  })
}

export function useGenerateImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      prompt,
      imageUrl,
    }: {
      prompt: string
      imageUrl: string
    }) => {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate image")
      }

      return response.json()
    },
  })
}

export function useGenerateVideo() {
  return useMutation({
    mutationFn: async ({
      prompt,
      imageUrl,
    }: {
      prompt: string
      imageUrl: string
    }) => {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate video")
      }

      return response.json()
    },
  })
}

export function useGenerateAvatar() {
  return useMutation({
    mutationFn: async ({
      text,
      imageUrl,
      voice,
      prompt,
      resolution,
    }: {
      text: string
      imageUrl: string
      voice: string
      prompt?: string
      resolution?: string
    }) => {
      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageUrl, voice, prompt, resolution }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate avatar video")
      }

      return response.json()
    },
  })
}

export function useVideoStatus(taskId: string | null, enabled: boolean = false) {
  return useQuery({
    queryKey: ["videoStatus", taskId],
    queryFn: async () => {
      if (!taskId) return null

      console.log("[v0] Fetching video status for taskId:", taskId)

      // Try the correct endpoint FIRST (record-info)
      let response = await fetch("/api/video-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })

      // If the real endpoint works, use it
      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Real API status:", {
          taskId,
          status: result.status,
          hasVideoUrl: !!result.videoUrl,
          message: result.message
        })
        return result
      }

      // Otherwise fall back to manual simulator
      console.log("[v0] Real API failed, using simulator")
      response = await fetch("/api/video-manual", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[v0] Video status check failed:", error)
        // Don't throw error, just return processing status
        return { status: "processing", taskId }
      }

      return response.json()
    },
    enabled: enabled && !!taskId,
    refetchInterval: (query) => {
      const data = query.state.data
      console.log("[v0] Checking refetch interval. Status:", data?.status)
      
      if (!data) return 30000 // 30 seconds
      if (data?.status === "processing") {
        console.log("[v0] Still processing, will refetch in 30 seconds")
        return 30000 // Keep polling every 30 seconds
      }
      
      console.log("[v0] Status is not processing, stopping polling")
      return false // Stop polling once completed or failed
    },
    retry: 3, // Retry failed requests
    retryDelay: 5000, // Wait 5 seconds before retry
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  })
}

// All videos hook for video library page with user filtering
export function useAllVideos(userId?: string) {
  return useQuery({
    queryKey: ["allVideos", userId],
    queryFn: async () => {
      await conversationDB.init()
      return conversationDB.getAllVideos(userId)
    },
    enabled: !!userId, // Only run if userId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Delete video mutation
export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoId: string) => {
      await conversationDB.deleteVideo(videoId)
      return videoId
    },
    onSuccess: () => {
      // Invalidate both allVideos and conversations queries (all user variations)
      queryClient.invalidateQueries({ queryKey: ["allVideos"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
    onError: (error) => {
      console.error("[v0] Delete video mutation failed:", error)
    },
  })
}

// Picture Me Templates hook
export function usePictureMeTemplates() {
  return useQuery({
    queryKey: queryKeys.pictureMeTemplates,
    queryFn: async () => {
      const response = await fetch('/api/picture-me/templates')
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`)
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Picture Me Sessions hook
export function usePictureMeSessions(userId?: string) {
  return useQuery({
    queryKey: [...queryKeys.pictureMeSessions, userId],
    queryFn: async () => {
      await conversationDB.init()
      return conversationDB.getAllPictureMe(userId)
    },
    enabled: !!userId,
  })
}

// Picture Me Session hook
export function usePictureMeSession(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.pictureMeSession(sessionId || ""),
    queryFn: async () => {
      if (!sessionId) return null
      return conversationDB.getPictureMeSession(sessionId)
    },
    enabled: !!sessionId,
  })
}

// Picture Me Generation mutation
export function usePictureMeGeneration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageUrl, template, userId }: {
      imageUrl: string
      template: string
      userId: string
    }) => {
      const response = await fetch('/api/picture-me/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, template, userId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Generation failed: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pictureMeSessions })
    },
    onError: (error) => {
      console.error("[Picture Me] Generation mutation failed:", error)
    },
  })
}

// Save Picture Me session mutation
export function useSavePictureMeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (session: PictureMeSession) => {
      await conversationDB.savePictureMeSession(session)
      return session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pictureMeSessions })
    },
  })
}

// Delete Picture Me session mutation
export function useDeletePictureMeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await conversationDB.deletePictureMeSession(sessionId)
      return sessionId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pictureMeSessions })
    },
  })
}
