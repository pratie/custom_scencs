import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

// Daily usage limits per user
export const DAILY_LIMITS = {
  images: 10,    // 10 image edits per day
  videos: 3,     // 3 motion videos per day
  avatars: 2,    // 2 avatar videos per day
} as const

interface UsageData {
  date: string
  images: number
  videos: number
  avatars: number
}

export class HybridUsageLimiter {
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD
  }

  // Keep localStorage as fallback/cache for immediate responses
  private getStorageKey(userId: string): string {
    return `usage_${userId}_${this.getTodayString()}`
  }

  private getLocalUsageData(userId: string): UsageData {
    const key = this.getStorageKey(userId)
    const stored = localStorage.getItem(key)

    if (!stored) {
      return {
        date: this.getTodayString(),
        images: 0,
        videos: 0,
        avatars: 0
      }
    }

    return JSON.parse(stored)
  }

  private saveLocalUsageData(userId: string, data: UsageData): void {
    const key = this.getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Sync with Supabase in background
  private async syncWithSupabase(userId: string, data: UsageData): Promise<void> {
    try {
      const { supabase } = await import('./supabase')
      await supabase
        .from('usage_tracking')
        .upsert({
          user_id: userId,
          date: data.date,
          images: data.images,
          videos: data.videos,
          avatars: data.avatars,
          updated_at: Date.now()
        })
    } catch (error) {
      console.warn('[Usage] Failed to sync to Supabase:', error)
      // Fail silently - localStorage backup works
    }
  }

  // Load from Supabase on startup
  async loadFromSupabase(userId: string): Promise<UsageData> {
    if (!userId) {
      return {
        date: this.getTodayString(),
        images: 0,
        videos: 0,
        avatars: 0
      }
    }

    try {
      const { supabase } = await import('./supabase')
      const today = this.getTodayString()

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      const usageData: UsageData = data ? {
        date: data.date,
        images: data.images,
        videos: data.videos,
        avatars: data.avatars
      } : {
        date: today,
        images: 0,
        videos: 0,
        avatars: 0
      }

      // Update localStorage cache
      this.saveLocalUsageData(userId, usageData)
      return usageData
    } catch (error) {
      console.warn('[Usage] Failed to load from Supabase, using local data:', error)
      return this.getLocalUsageData(userId)
    }
  }

  // Synchronous methods (for backwards compatibility)
  canUse(userId: string, type: keyof typeof DAILY_LIMITS): boolean {
    if (!userId) return false

    const usage = this.getLocalUsageData(userId)
    return usage[type] < DAILY_LIMITS[type]
  }

  getRemaining(userId: string, type: keyof typeof DAILY_LIMITS): number {
    if (!userId) return 0

    const usage = this.getLocalUsageData(userId)
    return Math.max(0, DAILY_LIMITS[type] - usage[type])
  }

  recordUsage(userId: string, type: keyof typeof DAILY_LIMITS): void {
    if (!userId) return

    const usage = this.getLocalUsageData(userId)
    usage[type] += 1
    this.saveLocalUsageData(userId, usage)

    // Sync to Supabase in background (fire and forget)
    this.syncWithSupabase(userId, usage).catch(console.warn)
  }

  getUsageStats(userId: string) {
    if (!userId) return null

    const usage = this.getLocalUsageData(userId)
    return {
      images: {
        used: usage.images,
        limit: DAILY_LIMITS.images,
        remaining: DAILY_LIMITS.images - usage.images
      },
      videos: {
        used: usage.videos,
        limit: DAILY_LIMITS.videos,
        remaining: DAILY_LIMITS.videos - usage.videos
      },
      avatars: {
        used: usage.avatars,
        limit: DAILY_LIMITS.avatars,
        remaining: DAILY_LIMITS.avatars - usage.avatars
      }
    }
  }
}

export const hybridUsageLimiter = new HybridUsageLimiter()

// React hook for easy usage in components
export function useUsageLimits() {
  const { data: session } = useSession()
  const userId = session?.user?.email || ''
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from Supabase on mount
  useEffect(() => {
    if (userId && !isLoaded) {
      hybridUsageLimiter.loadFromSupabase(userId).then(() => {
        setIsLoaded(true)
      })
    }
  }, [userId, isLoaded])

  return {
    // Keep synchronous interface
    canUseImages: () => hybridUsageLimiter.canUse(userId, 'images'),
    canUseVideos: () => hybridUsageLimiter.canUse(userId, 'videos'),
    canUseAvatars: () => hybridUsageLimiter.canUse(userId, 'avatars'),

    recordImageUse: () => hybridUsageLimiter.recordUsage(userId, 'images'),
    recordVideoUse: () => hybridUsageLimiter.recordUsage(userId, 'videos'),
    recordAvatarUse: () => hybridUsageLimiter.recordUsage(userId, 'avatars'),

    getRemainingImages: () => hybridUsageLimiter.getRemaining(userId, 'images'),
    getRemainingVideos: () => hybridUsageLimiter.getRemaining(userId, 'videos'),
    getRemainingAvatars: () => hybridUsageLimiter.getRemaining(userId, 'avatars'),

    getStats: () => hybridUsageLimiter.getUsageStats(userId),

    userId,
    isLoaded
  }
}