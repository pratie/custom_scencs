import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { conversationDB, type Conversation } from "./indexeddb"

// Query keys
export const queryKeys = {
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversation", id] as const,
}

// Conversations hook
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      await conversationDB.init()
      return conversationDB.getAllConversations()
    },
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
