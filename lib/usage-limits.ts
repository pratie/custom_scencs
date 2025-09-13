import { useSession } from "next-auth/react"

// Daily usage limits per user
export const DAILY_LIMITS = {
  images: 10,           // 10 image edits per day
  videos: 3,            // 3 motion videos per day
  avatars: 2,           // 2 avatar videos per day
  pictureMeSessions: 5, // 5 Picture Me sessions per day
  pictureMeImages: 15,  // 15 total Picture Me images per day (5 sessions × 3 variants)
} as const

interface UsageData {
  date: string
  images: number
  videos: number
  avatars: number
  pictureMeSessions: number
  pictureMeImages: number
}

export class UsageLimiter {
  private getStorageKey(userId: string): string {
    return `usage_${userId}_${this.getTodayString()}`
  }

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD
  }

  private getUsageData(userId: string): UsageData {
    const key = this.getStorageKey(userId)
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return {
        date: this.getTodayString(),
        images: 0,
        videos: 0,
        avatars: 0,
        pictureMeSessions: 0,
        pictureMeImages: 0
      }
    }

    const parsed = JSON.parse(stored)
    // Ensure new fields exist for backward compatibility
    return {
      date: parsed.date || this.getTodayString(),
      images: parsed.images || 0,
      videos: parsed.videos || 0,
      avatars: parsed.avatars || 0,
      pictureMeSessions: parsed.pictureMeSessions || 0,
      pictureMeImages: parsed.pictureMeImages || 0
    }
  }

  private saveUsageData(userId: string, data: UsageData): void {
    const key = this.getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Check if user can perform action
  canUse(userId: string, type: keyof typeof DAILY_LIMITS): boolean {
    if (!userId) return false
    
    const usage = this.getUsageData(userId)
    return usage[type] < DAILY_LIMITS[type]
  }

  // Get remaining uses for user
  getRemaining(userId: string, type: keyof typeof DAILY_LIMITS): number {
    if (!userId) return 0
    
    const usage = this.getUsageData(userId)
    return Math.max(0, DAILY_LIMITS[type] - usage[type])
  }

  // Record usage (call after successful API call)
  recordUsage(userId: string, type: keyof typeof DAILY_LIMITS): void {
    if (!userId) return
    
    const usage = this.getUsageData(userId)
    usage[type] += 1
    this.saveUsageData(userId, usage)
  }

  // Get all usage stats for user
  getUsageStats(userId: string) {
    if (!userId) return null
    
    const usage = this.getUsageData(userId)
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
      },
      pictureMeSessions: {
        used: usage.pictureMeSessions,
        limit: DAILY_LIMITS.pictureMeSessions,
        remaining: DAILY_LIMITS.pictureMeSessions - usage.pictureMeSessions
      },
      pictureMeImages: {
        used: usage.pictureMeImages,
        limit: DAILY_LIMITS.pictureMeImages,
        remaining: DAILY_LIMITS.pictureMeImages - usage.pictureMeImages
      }
    }
  }

  // Reset limits for new day (automatic)
  private cleanupOldData(): void {
    const today = this.getTodayString()
    const keys = Object.keys(localStorage).filter(key => key.startsWith('usage_'))
    
    keys.forEach(key => {
      if (!key.includes(today)) {
        localStorage.removeItem(key) // Remove old usage data
      }
    })
  }
}

export const usageLimiter = new UsageLimiter()

// React hook for easy usage in components
export function useUsageLimits() {
  const { data: session } = useSession()
  const userId = session?.user?.email || ''

  return {
    canUseImages: () => usageLimiter.canUse(userId, 'images'),
    canUseVideos: () => usageLimiter.canUse(userId, 'videos'),
    canUseAvatars: () => usageLimiter.canUse(userId, 'avatars'),
    canUsePictureMeSessions: () => usageLimiter.canUse(userId, 'pictureMeSessions'),
    canUsePictureMeImages: () => usageLimiter.canUse(userId, 'pictureMeImages'),

    recordImageUse: () => usageLimiter.recordUsage(userId, 'images'),
    recordVideoUse: () => usageLimiter.recordUsage(userId, 'videos'),
    recordAvatarUse: () => usageLimiter.recordUsage(userId, 'avatars'),
    recordPictureMeSessionUse: () => usageLimiter.recordUsage(userId, 'pictureMeSessions'),
    recordPictureMeImageUse: () => usageLimiter.recordUsage(userId, 'pictureMeImages'),

    getRemainingImages: () => usageLimiter.getRemaining(userId, 'images'),
    getRemainingVideos: () => usageLimiter.getRemaining(userId, 'videos'),
    getRemainingAvatars: () => usageLimiter.getRemaining(userId, 'avatars'),
    getRemainingPictureMeSessions: () => usageLimiter.getRemaining(userId, 'pictureMeSessions'),
    getRemainingPictureMeImages: () => usageLimiter.getRemaining(userId, 'pictureMeImages'),

    // Generic methods for flexibility
    canUse: (type: keyof typeof DAILY_LIMITS) => usageLimiter.canUse(userId, type),
    getRemaining: (type: keyof typeof DAILY_LIMITS) => usageLimiter.getRemaining(userId, type),
    recordUsage: (type: keyof typeof DAILY_LIMITS) => usageLimiter.recordUsage(userId, type),

    getStats: () => usageLimiter.getUsageStats(userId),
    DAILY_LIMITS,

    userId
  }
}