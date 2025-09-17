import { createClient } from '@supabase/supabase-js'
import type { Conversation, ChatMessage, GeneratedImage, GeneratedVideo, TextElement } from "./indexeddb"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Usage tracking interface (matches your localStorage structure)
interface UsageData {
  date: string
  images: number
  videos: number
  avatars: number
}

class SupabaseDB {
  async init(): Promise<void> {
    // Supabase client is ready immediately, no init needed
    return Promise.resolve()
  }

  async saveConversation(conversation: Conversation): Promise<Conversation> {
    const payload = {
      id: conversation.id,
      user_id: conversation.userId,
      title: conversation.title,
      messages: conversation.messages,
      generated_images: conversation.generatedImages,
      generated_videos: conversation.generatedVideos || [],
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt
    }

    console.log('[Supabase] Attempting to save conversation:', {
      id: payload.id,
      user_id: payload.user_id,
      title: payload.title,
      messagesCount: payload.messages?.length || 0,
      imagesCount: payload.generated_images?.length || 0,
      videosCount: payload.generated_videos?.length || 0,
      created_at: payload.created_at,
      updated_at: payload.updated_at
    })

    const { data, error } = await supabase
      .from('conversations')
      .upsert(payload)
      .select()

    console.log('[Supabase] Save result:', { data, error })

    if (error) {
      console.error('[Supabase] Detailed error information:', {
        error: JSON.stringify(error, null, 2),
        errorType: typeof error,
        errorKeys: Object.keys(error || {}),
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        conversationId: conversation.id,
        userId: conversation.userId,
        payloadSize: JSON.stringify(payload).length
      })
      throw error
    }

    console.log('[Supabase] Conversation saved successfully')
    return conversation
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - conversation doesn't exist
        return null
      }
      console.error('[Supabase] Error getting conversation:', error)
      throw error
    }

    if (!data) return null

    // Transform back to your interface
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      messages: data.messages as ChatMessage[],
      generatedImages: data.generated_images as GeneratedImage[],
      generatedVideos: data.generated_videos as GeneratedVideo[],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  async getAllConversations(userId?: string): Promise<Conversation[]> {
    if (!userId) return []

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Supabase] Error getting conversations:', error)
      throw error
    }

    // Transform back to your interface
    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      messages: row.messages as ChatMessage[],
      generatedImages: row.generated_images as GeneratedImage[],
      generatedVideos: row.generated_videos as GeneratedVideo[] || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  }

  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Supabase] Error deleting conversation:', error)
      throw error
    }
  }

  async getAllVideos(userId?: string): Promise<GeneratedVideo[]> {
    if (!userId) return []

    // Get user-specific conversations and extract videos
    const conversations = await this.getAllConversations(userId)
    const allVideos: GeneratedVideo[] = []

    conversations.forEach((conversation) => {
      if (conversation.generatedVideos) {
        allVideos.push(...conversation.generatedVideos)
      }
    })

    // Sort by timestamp (newest first)
    allVideos.sort((a, b) => b.timestamp - a.timestamp)
    return allVideos
  }

  async deleteVideo(videoId: string): Promise<void> {
    // First, find which conversation contains this video
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('*')

    if (fetchError) {
      console.error('[Supabase] Error fetching conversations for video deletion:', fetchError)
      throw fetchError
    }

    for (const conversation of conversations || []) {
      const generatedVideos = conversation.generated_videos as GeneratedVideo[] || []

      if (generatedVideos.some(video => video.id === videoId)) {
        // Remove the video from this conversation
        const updatedVideos = generatedVideos.filter(video => video.id !== videoId)

        const { error: updateError } = await supabase
          .from('conversations')
          .update({
            generated_videos: updatedVideos,
            updated_at: Date.now()
          })
          .eq('id', conversation.id)

        if (updateError) {
          console.error('[Supabase] Error updating conversation after video deletion:', updateError)
          throw updateError
        }

        break
      }
    }
  }

  async clearAllData(): Promise<void> {
    // Clear all conversations for the current user
    // Note: This would need user context - for now we'll skip implementation
    // since your original version also cleared all data without user filtering
    console.warn('[Supabase] clearAllData not implemented for multi-user setup')
  }
}

// Usage tracking with Supabase (replaces localStorage)
export class SupabaseUsageLimiter {
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD
  }

  private async getUsageData(userId: string): Promise<UsageData> {
    if (!userId) {
      return {
        date: this.getTodayString(),
        images: 0,
        videos: 0,
        avatars: 0
      }
    }

    const today = this.getTodayString()

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No usage record for today - return defaults
        return {
          date: today,
          images: 0,
          videos: 0,
          avatars: 0
        }
      }
      console.error('[Supabase] Error getting usage data:', error)
      throw error
    }

    return {
      date: data.date,
      images: data.images,
      videos: data.videos,
      avatars: data.avatars
    }
  }

  private async saveUsageData(userId: string, data: UsageData): Promise<void> {
    if (!userId) return

    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        date: data.date,
        images: data.images,
        videos: data.videos,
        avatars: data.avatars,
        updated_at: Date.now()
      })

    if (error) {
      console.error('[Supabase] Error saving usage data:', error)
      throw error
    }
  }

  async canUse(userId: string, type: 'images' | 'videos' | 'avatars', limits: { images: number, videos: number, avatars: number }): Promise<boolean> {
    if (!userId) return false

    try {
      const usage = await this.getUsageData(userId)
      return usage[type] < limits[type]
    } catch (error) {
      console.error('[Supabase] Error checking usage limits:', error)
      // On error, be permissive
      return true
    }
  }

  async getRemaining(userId: string, type: 'images' | 'videos' | 'avatars', limits: { images: number, videos: number, avatars: number }): Promise<number> {
    if (!userId) return 0

    try {
      const usage = await this.getUsageData(userId)
      return Math.max(0, limits[type] - usage[type])
    } catch (error) {
      console.error('[Supabase] Error getting remaining usage:', error)
      return limits[type] // On error, return full limit
    }
  }

  async recordUsage(userId: string, type: 'images' | 'videos' | 'avatars'): Promise<void> {
    if (!userId) return

    try {
      const usage = await this.getUsageData(userId)
      usage[type] += 1
      await this.saveUsageData(userId, usage)
    } catch (error) {
      console.error('[Supabase] Error recording usage:', error)
      // Don't throw - usage tracking shouldn't break the app
    }
  }

  async getUsageStats(userId: string, limits: { images: number, videos: number, avatars: number }) {
    if (!userId) return null

    try {
      const usage = await this.getUsageData(userId)
      return {
        images: {
          used: usage.images,
          limit: limits.images,
          remaining: limits.images - usage.images
        },
        videos: {
          used: usage.videos,
          limit: limits.videos,
          remaining: limits.videos - usage.videos
        },
        avatars: {
          used: usage.avatars,
          limit: limits.avatars,
          remaining: limits.avatars - usage.avatars
        }
      }
    } catch (error) {
      console.error('[Supabase] Error getting usage stats:', error)
      return null
    }
  }
}

export const conversationDB = new SupabaseDB()
export const supabaseUsageLimiter = new SupabaseUsageLimiter()

// Re-export types for compatibility
export type { Conversation, ChatMessage, GeneratedImage, GeneratedVideo, TextElement }