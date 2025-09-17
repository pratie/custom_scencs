import { useSession } from "next-auth/react"
import { supabaseUsageLimiter } from "./supabase"

// Daily usage limits per user
export const DAILY_LIMITS = {
  images: 10,    // 10 image edits per day
  videos: 3,     // 3 motion videos per day
  avatars: 2,    // 2 avatar videos per day
} as const

// React hook for easy usage in components (updated for Supabase)
export function useUsageLimits() {
  const { data: session } = useSession()
  const userId = session?.user?.email || ''

  return {
    canUseImages: async () => {
      return await supabaseUsageLimiter.canUse(userId, 'images', DAILY_LIMITS)
    },
    canUseVideos: async () => {
      return await supabaseUsageLimiter.canUse(userId, 'videos', DAILY_LIMITS)
    },
    canUseAvatars: async () => {
      return await supabaseUsageLimiter.canUse(userId, 'avatars', DAILY_LIMITS)
    },

    recordImageUse: async () => {
      await supabaseUsageLimiter.recordUsage(userId, 'images')
    },
    recordVideoUse: async () => {
      await supabaseUsageLimiter.recordUsage(userId, 'videos')
    },
    recordAvatarUse: async () => {
      await supabaseUsageLimiter.recordUsage(userId, 'avatars')
    },

    getRemainingImages: async () => {
      return await supabaseUsageLimiter.getRemaining(userId, 'images', DAILY_LIMITS)
    },
    getRemainingVideos: async () => {
      return await supabaseUsageLimiter.getRemaining(userId, 'videos', DAILY_LIMITS)
    },
    getRemainingAvatars: async () => {
      return await supabaseUsageLimiter.getRemaining(userId, 'avatars', DAILY_LIMITS)
    },

    getStats: async () => {
      return await supabaseUsageLimiter.getUsageStats(userId, DAILY_LIMITS)
    },

    userId
  }
}